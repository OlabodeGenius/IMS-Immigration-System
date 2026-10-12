import React, { useState, useMemo } from "react";
import {
    Box,
    Typography,
    Paper,
    ToggleButton,
    ToggleButtonGroup,
    CircularProgress,
    Stack
} from "@mui/material";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import { Tooltip } from "react-tooltip";
import { useGlobalHeatmapData } from "../../../hooks/useAnalytics";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

type MetricType = "density" | "risk";

export function WorldHeatmap() {
    const { data: heatmapData, isLoading, error } = useGlobalHeatmapData();
    const [metric, setMetric] = useState<MetricType>("density");

    const handleMetricChange = (
        _event: React.MouseEvent<HTMLElement>,
        newMetric: MetricType | null
    ) => {
        if (newMetric !== null) {
            setMetric(newMetric);
        }
    };

    const colorScale = useMemo(() => {
        if (!heatmapData || heatmapData.length === 0) {
            return scaleLinear<string>().domain([0, 1]).range(["#e2e8f0", "#e2e8f0"]);
        }

        if (metric === "density") {
            const maxStudents = Math.max(...heatmapData.map((d) => d.students));
            return scaleLinear<string>()
                .domain([0, maxStudents])
                .range(["#dbeafe", "#1e3a8a"]); // Light blue to dark blue
        } else {
            const maxVisas = Math.max(...heatmapData.map((d) => d.expiringVisas));
            return scaleLinear<string>()
                .domain([0, maxVisas])
                .range(["#fee2e2", "#7f1d1d"]); // Light red to dark red
        }
    }, [heatmapData, metric]);

    if (isLoading) {
        return (
            <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: "1px solid #E2E8F0", display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
                <CircularProgress />
            </Paper>
        );
    }

    if (error) {
        return (
            <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: "1px solid #E2E8F0" }}>
                <Typography color="error">Failed to load geographic data.</Typography>
            </Paper>
        );
    }

    return (
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #E2E8F0", mb: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Box>
                    <Typography variant="h6" fontWeight={800}>
                        Global Student Distribution
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {metric === "density" 
                            ? "Density by country of origin." 
                            : "Regions with visas expiring in the next 30 days."}
                    </Typography>
                </Box>
                <ToggleButtonGroup
                    value={metric}
                    exclusive
                    onChange={handleMetricChange}
                    aria-label="map metric"
                    size="small"
                >
                    <ToggleButton value="density" aria-label="student density" sx={{ fontWeight: 600 }}>
                        Density
                    </ToggleButton>
                    <ToggleButton value="risk" aria-label="visa risk" sx={{ fontWeight: 600 }}>
                        Visa Risk
                    </ToggleButton>
                </ToggleButtonGroup>
            </Stack>

            <Box sx={{ width: "100%", height: 400, bgcolor: "#f8fafc", borderRadius: 2, overflow: "hidden", position: "relative" }}>
                <ComposableMap
                    projectionConfig={{
                        scale: 140,
                        center: [0, 20]
                    }}
                    width={800}
                    height={400}
                    style={{ width: "100%", height: "100%" }}
                >
                    <ZoomableGroup>
                        <Geographies geography={geoUrl}>
                            {({ geographies }) =>
                                geographies.map((geo) => {
                                    // Match geo properties with our mock data using ISO alpha-3
                                    // world-atlas TopoJSON has geo.id as a 3-digit numeric code, 
                                    // but we can map it or just match name for simplicity since our mock is small.
                                    // Actually, world-atlas properties usually have name. Let's use name.
                                    const d = heatmapData?.find(s => s.name === geo.properties.name);
                                    
                                    let val = 0;
                                    if (d) {
                                        val = metric === "density" ? d.students : d.expiringVisas;
                                    }

                                    return (
                                        <Geography
                                            key={geo.rsmKey}
                                            geography={geo}
                                            fill={d ? colorScale(val) : "#e2e8f0"}
                                            stroke="#ffffff"
                                            strokeWidth={0.5}
                                            data-tooltip-id="map-tooltip"
                                            data-tooltip-content={`${geo.properties.name} - ${val.toLocaleString()} ${metric === "density" ? "Students" : "Expiring Visas"}`}
                                            style={{
                                                default: { outline: "none" },
                                                hover: { fill: "#cbd5e1", outline: "none", cursor: "pointer" },
                                                pressed: { outline: "none" },
                                            }}
                                        />
                                    );
                                })
                            }
                        </Geographies>
                    </ZoomableGroup>
                </ComposableMap>
                <Tooltip id="map-tooltip" />
            </Box>
        </Paper>
    );
}
