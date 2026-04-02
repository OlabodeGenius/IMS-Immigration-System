import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";

export function useAnalyticsSummary() {
    return useQuery({
        queryKey: ["analytics_summary"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("analytics_summary")
                .select("*")
                .single();

            if (error) throw error;
            return data;
        },
        staleTime: 1000 * 60 * 5,
    });
}

export function useInstitutionMetrics(institutionId?: string) {
    return useQuery({
        queryKey: ["institution_metrics", institutionId],
        queryFn: async () => {
            if (!institutionId) return null;

            // Total Students
            const { count: totalStudents } = await supabase
                .from("students")
                .select("*", { count: 'exact', head: true })
                .eq("institution_id", institutionId);

            // Visa Metrics
            const today = new Date();
            const getExpiringCount = async (days: number) => {
                const futureDate = new Date();
                futureDate.setDate(today.getDate() + days);

                // Join students to filter by institution_id
                const { count } = await supabase
                    .from("visas")
                    .select("id, student:students!inner(institution_id)", { count: 'exact', head: true })
                    .eq("student.institution_id", institutionId)
                    .eq("status", "ACTIVE")
                    .lte("end_date", futureDate.toISOString().split('T')[0])
                    .gte("end_date", today.toISOString().split('T')[0]);

                return count || 0;
            };

            const [v60, v30, v7] = await Promise.all([
                getExpiringCount(60),
                getExpiringCount(30),
                getExpiringCount(7)
            ]);

            // Overdue (Expired ACTIVE visas)
            const { count: overdue } = await supabase
                .from("visas")
                .select("id, student:students!inner(institution_id)", { count: 'exact', head: true })
                .eq("student.institution_id", institutionId)
                .lt("end_date", today.toISOString().split('T')[0])
                .eq("status", "ACTIVE");

            return {
                total_students: totalStudents || 0,
                visas_expiring_60: v60,
                visas_expiring_30: v30,
                visas_expiring_7: v7,
                overdue_notices: overdue || 0
            };
        },
        enabled: !!institutionId,
    });
}

export function useStudentsByNationality(institutionId?: string) {
    return useQuery({
        queryKey: ["analytics_nationality", institutionId],
        queryFn: async () => {
            let query = supabase
                .from("students")
                .select("nationality");

            if (institutionId) {
                query = query.eq("institution_id", institutionId);
            }

            const { data, error } = await query;
            if (error) throw error;

            const counts: Record<string, number> = {};
            data.forEach(s => {
                counts[s.nationality] = (counts[s.nationality] || 0) + 1;
            });

            return Object.entries(counts)
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 5); // Just top 5 for the chart
        }
    });
}

export function useStudentsByProgram(institutionId?: string) {
    return useQuery({
        queryKey: ["analytics_program", institutionId],
        queryFn: async () => {
            let query = supabase
                .from("students")
                .select("metadata");

            if (institutionId) {
                query = query.eq("institution_id", institutionId);
            }

            const { data, error } = await query;
            if (error) throw error;

            const counts: Record<string, number> = {};
            data.forEach(s => {
                const program = (s.metadata as any)?.program || "Unassigned";
                counts[program] = (counts[program] || 0) + 1;
            });

            return Object.entries(counts).map(([name, value]) => ({ name, value }));
        }
    });
}

export function useAllComplianceMetrics(city?: string) {
    return useQuery({
        queryKey: ["all_compliance_metrics", city],
        queryFn: async () => {
            const today = new Date().toISOString().split('T')[0];
            const nearingDate = new Date();
            nearingDate.setDate(nearingDate.getDate() + 30);
            const nearingStr = nearingDate.toISOString().split('T')[0];

            let query = supabase
                .from("institutions")
                .select(`
                    id,
                    name,
                    students (
                        id,
                        visa:visas (
                            status,
                            end_date
                        )
                    )
                `);

            if (city && city !== "National") {
                query = query.eq('city', city);
            }

            const { data, error } = await query;

            if (error) throw error;

            return data.map(inst => {
                let compliant = 0;
                let nearing = 0;
                let overdue = 0;

                inst.students?.forEach((s: any) => {
                    const visa = Array.isArray(s.visa) ? s.visa[0] : s.visa;
                    if (!visa) return;

                    if (visa.status === 'ACTIVE') {
                        if (visa.end_date < today) {
                            overdue++;
                        } else if (visa.end_date <= nearingStr) {
                            nearing++;
                        } else {
                            compliant++;
                        }
                    } else if (visa.status === 'EXPIRED') {
                        overdue++;
                    }
                });

                return {
                    id: inst.id,
                    university: inst.name,
                    compliant,
                    nearing,
                    overdue
                };
            });
        }
    });
}

export function useSystemCriticalAlerts() {
    return useQuery({
        queryKey: ["system_critical_alerts"],
        queryFn: async () => {
            const today = new Date().toISOString().split('T')[0];

            // Fetch expiring/expired visas with student info
            const { data: visas, error: visaError } = await supabase
                .from("visas")
                .select(`
                    id,
                    status,
                    end_date,
                    student:students (
                        id,
                        full_name,
                        student_id_number,
                        institution:institutions(name)
                    )
                `)
                .or(`status.eq.EXPIRED,and(status.eq.ACTIVE,end_date.lt.${today})`)
                .limit(10);

            if (visaError) throw visaError;

            return visas.map((v: any) => ({
                id: v.id,
                title: v.status === 'EXPIRED' ? 'Visa Expired' : 'Visa Overdue',
                studentId: v.student?.student_id_number,
                studentName: v.student?.full_name,
                time: new Date(v.end_date).toLocaleDateString(),
                location: v.student?.institution?.name || 'Unknown',
                type: 'VISA_ALERT'
            }));
        }
    });
}

export function useGlobalKPIs(city?: string) {
    return useQuery({
        queryKey: ["global_kpis", city],
        queryFn: async () => {
            let instIds: string[] = [];

            if (city && city !== "National") {
                const { data: insts } = await supabase.from('institutions').select('id').eq('city', city);
                if (!insts || insts.length === 0) {
                    return { total_students: 0, active_visas: 0, overdue_notifications: 0, high_risk_alerts: 0 };
                }
                instIds = insts.map(i => i.id);
            }

            let studentsQuery = supabase.from("students").select("id", { count: 'exact', head: true });
            let visasQuery = supabase.from("visas").select("id, student:students!inner(institution_id)", { count: 'exact', head: true });
            let overdueQuery = supabase.from("visas").select("id, student:students!inner(institution_id)", { count: 'exact', head: true });

            if (instIds.length > 0) {
                studentsQuery = studentsQuery.in("institution_id", instIds);
                visasQuery = visasQuery.in("student.institution_id", instIds);
                overdueQuery = overdueQuery.in("student.institution_id", instIds);
            }

            const [{ count: totalStudents }, { count: activeVisas }] = await Promise.all([
                studentsQuery,
                visasQuery.eq("status", "ACTIVE")
            ]);

            const today = new Date().toISOString().split('T')[0];
            const { count: overdueVisas } = await overdueQuery.eq("status", "ACTIVE").lt("end_date", today);

            return {
                total_students: totalStudents || 0,
                active_visas: activeVisas || 0,
                overdue_notifications: overdueVisas || 0,
                high_risk_alerts: (overdueVisas || 0) > 0 ? Math.ceil((overdueVisas || 0) / 2) : 0
            };
        }
    });
}

export function usePresenceTrends(filter?: { institutionId?: string; city?: string }) {
    return useQuery({
        queryKey: ["presence_trends", filter?.institutionId, filter?.city],
        queryFn: async () => {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const dateStr = thirtyDaysAgo.toISOString().split('T')[0];

            let query = supabase
                .from("attendance_records")
                .select("attendance_date, status")
                .gte("attendance_date", dateStr);

            let filterStudentIds: string[] | null = null;

            if (filter?.institutionId) {
                const { data: students } = await supabase
                    .from("students")
                    .select("id")
                    .eq("institution_id", filter.institutionId);
                filterStudentIds = students ? students.map(s => s.id) : [];
            } else if (filter?.city && filter.city !== "National") {
                const { data: insts } = await supabase.from('institutions').select('id').eq('city', filter.city);
                if (insts && insts.length > 0) {
                    const instIds = insts.map(i => i.id);
                    const { data: students } = await supabase.from("students").select("id").in("institution_id", instIds);
                    filterStudentIds = students ? students.map(s => s.id) : [];
                } else {
                    return [];
                }
            }

            if (filterStudentIds !== null) {
                if (filterStudentIds.length > 0) {
                    query = query.in("student_id", filterStudentIds);
                } else {
                    return [];
                }
            }

            const { data, error } = await query.order("attendance_date", { ascending: true });
            if (error) throw error;

            // Aggregate by date
            const dailyData: Record<string, { total: number; present: number }> = {};
            data.forEach(rec => {
                const date = rec.attendance_date;
                if (!dailyData[date]) dailyData[date] = { total: 0, present: 0 };
                dailyData[date].total++;
                if (rec.status === 'PRESENT' || rec.status === 'LATE') {
                    dailyData[date].present++;
                }
            });


            return Object.entries(dailyData).map(([date, counts]) => ({
                date: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                rate: Math.round((counts.present / counts.total) * 100)
            }));
        }
    });
}

/**
 * Fetches the total number of students grouped by institution.
 * If a city is provided (and not "National"), only institutions in that city are included.
 */
export function useStudentsByInstitution(city?: string) {
    return useQuery({
        queryKey: ["students_by_institution", city],
        queryFn: async () => {
            let query = supabase
                .from("institutions")
                .select(`
                    id,
                    name,
                    city,
                    students ( id )
                `);

            if (city && city !== "National") {
                query = query.eq("city", city);
            }

            const { data, error } = await query;
            if (error) throw error;

            return (data || [])
                .map(inst => ({
                    name: inst.name,
                    students: Array.isArray(inst.students) ? inst.students.length : 0,
                }))
                .sort((a, b) => b.students - a.students);
        }
    });
}
