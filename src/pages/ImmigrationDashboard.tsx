import React, { useMemo } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import { DashboardShell } from "../components/DashboardShell";
import { InstitutionsTab } from "../components/dashboard/immigration/InstitutionsTab";
import { StudentsTab } from "../components/dashboard/immigration/StudentsTab";
import { VisasTab } from "../components/dashboard/immigration/VisasTab";
import { VerificationTab } from "../components/dashboard/immigration/VerificationTab";
import { OverviewTab } from "../components/dashboard/immigration/OverviewTab";
import AuditLedgerTab from "../components/dashboard/immigration/AuditLedgerTab";
import { VisaApplicationsTab } from "../components/dashboard/immigration/VisaApplicationsTab";
import { useLocation, useNavigate } from "react-router-dom";

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ py: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export default function ImmigrationDashboard() {
    const location = useLocation();
    const navigate = useNavigate();

    // Parse tab and search from URL
    const queryParams = new URLSearchParams(location.search);
    const urlSearch = queryParams.get("search") || "";

    const tabValue = useMemo(() => {
        const tab = queryParams.get('tab');
        if (tab === 'overview') return 0;
        if (tab === 'students') return 1;
        if (tab === 'institutions') return 2;
        if (tab === 'visas') return 3;
        if (tab === 'verification') return 4;
        if (tab === 'audit') return 5;
        if (tab === 'applications') return 6;
        return 0;
    }, [location.search]);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        const tabs = ['overview', 'students', 'institutions', 'visas', 'verification', 'audit', 'applications'];
        navigate(`/dashboard?tab=${tabs[newValue]}`);
    };

    return (
        <DashboardShell title="National Oversight Platform">
            <Box sx={{
                mb: 4,
                bgcolor: 'white',
                borderRadius: 4,
                p: 1,
                border: '1px solid #F1F5F9',
                display: 'inline-flex'
            }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    aria-label="immigration dashboard tabs"
                    sx={{
                        '& .MuiTabs-indicator': { display: 'none' },
                        '& .MuiTab-root': {
                            borderRadius: 3,
                            fontWeight: 700,
                            minHeight: 44,
                            px: 3,
                            transition: 'all 0.2s',
                            '&.Mui-selected': {
                                bgcolor: 'primary.main',
                                color: 'white',
                                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
                            }
                        }
                    }}
                >
                    <Tab label="Overview" />
                    <Tab label="Students" />
                    <Tab label="Universities" />
                    <Tab label="Visas" />
                    <Tab label="Verification" />
                    <Tab label="Audit Ledger" />
                    <Tab label="Visa Applications" />
                </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
                <OverviewTab />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
                <StudentsTab initialSearch={urlSearch} />
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
                <InstitutionsTab />
            </TabPanel>
            <TabPanel value={tabValue} index={3}>
                <VisasTab />
            </TabPanel>
            <TabPanel value={tabValue} index={4}>
                <VerificationTab />
            </TabPanel>
            <TabPanel value={tabValue} index={5}>
                <AuditLedgerTab />
            </TabPanel>
            <TabPanel value={tabValue} index={6}>
                <VisaApplicationsTab />
            </TabPanel>
        </DashboardShell>
    );
}