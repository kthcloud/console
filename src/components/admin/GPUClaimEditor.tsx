import {
  Stack,
  TextField,
  Button,
  MenuItem,
  IconButton,
  Paper,
  Autocomplete,
  Typography,
  Chip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  GenericDeviceConfiguration,
  RequestedGpuCreate,
} from "../../temporaryTypesRemoveMe";

interface Props {
  value: RequestedGpuCreate[];
  onChange: (value: RequestedGpuCreate[]) => void;
}

export default function GpuClaimEditor({ value, onChange }: Props) {
  const update = (idx: number, patch: Partial<RequestedGpuCreate>) => {
    const next = [...value];
    next[idx] = { ...next[idx], ...patch };
    onChange(next);
  };

  const updateRequested = (idx: number, patch: Partial<RequestedGpuCreate>) => {
    const next = [...value];
    next[idx] = {
      ...next[idx],
      ...patch,
    };
    onChange(next);
  };

  return (
    <Stack spacing={2}>
      {value.map((req, idx) => {
        const gpu = req;

        return (
          <Paper key={idx} variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={2}>
              {/* Header */}
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  label="Request name"
                  value={req.name}
                  onChange={(e) => update(idx, { name: e.target.value })}
                  required
                  fullWidth
                />

                <IconButton
                  color="error"
                  onClick={() => onChange(value.filter((_, i) => i !== idx))}
                >
                  <DeleteIcon />
                </IconButton>
              </Stack>

              <TextField
                select
                label="Allocation mode"
                value={gpu.allocationMode}
                onChange={(e) =>
                  updateRequested(idx, {
                    allocationMode: e.target.value,
                  })
                }
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="ExactCount">Exact count</MenuItem>
              </TextField>

              {gpu.allocationMode === "ExactCount" && (
                <TextField
                  type="number"
                  label="GPU count"
                  value={gpu.count ?? ""}
                  onChange={(e) =>
                    updateRequested(idx, {
                      count: Number(e.target.value),
                    })
                  }
                />
              )}

              <TextField
                label="Device class name"
                value={gpu.deviceClassName}
                onChange={(e) =>
                  updateRequested(idx, {
                    deviceClassName: e.target.value,
                  })
                }
                placeholder="nvidia.com/gpu"
                defaultValue={"nvidia.com/gpu"}
                helperText="RFC1123 name"
                required
              />

              {/* TODO: CEL expr for selectors*/}
              {/* <Autocomplete
                multiple
                freeSolo
                options={["e"]}
                label="Selectors"
                value={gpu.selectors}
                onChange={(_, sel) => {
                  updateRequested(idx, {
                    selectors: sel,
                  });
                }}
              /> */}

              <Stack spacing={2}>
                <Typography>{"Driver configuration"}</Typography>
                <TextField
                  label="Driver"
                  placeholder="gpu.nvidia.com"
                  defaultValue={"gpu.nvidia.com"}
                  value={
                    (gpu.config as GenericDeviceConfiguration)?.driver ?? ""
                  }
                  onChange={(e) =>
                    updateRequested(idx, {
                      config: { driver: e.target.value },
                    })
                  }
                />
                {(gpu.config as GenericDeviceConfiguration)?.driver ==
                  "gpu.nvidia.com" && (
                  <>
                    <Autocomplete
                      options={["MPS", "TimeSlicing"]}
                      value={
                        (gpu.config as any)?.parameters?.sharing?.strategy || ""
                      }
                      onChange={(_, strat) =>
                        updateRequested(idx, {
                          config: {
                            driver:
                              (gpu.config as GenericDeviceConfiguration)
                                ?.driver || "gpu.nvidia.com",
                            parameters: {
                              ...(gpu.config as any)?.parameters,
                              sharing: {
                                ...(gpu.config as any)?.parameters?.sharing,
                                strategy: strat,
                              },
                            },
                          },
                        })
                      }
                      renderTags={(s, getTagProps) =>
                        s.map((strategy, index) => (
                          <Chip {...getTagProps({ index })} label={strategy} />
                        ))
                      }
                      renderInput={(params) => (
                        <TextField {...params} label="Sharing Strategy" />
                      )}
                    />

                    <>
                      {(gpu.config as any)?.parameters?.sharing?.strategy ==
                      "MPS" ? (
                        <Stack spacing={1} pl={2}>
                          <Typography variant="subtitle2">
                            MPS Configuration
                          </Typography>

                          <TextField
                            label="Default Active Thread Percentage"
                            type="number"
                            value={
                              (gpu.config as any)?.parameters?.sharing?.mps
                                ?.defaultActiveThreadPercentage ?? ""
                            }
                            onChange={(e) =>
                              updateRequested(idx, {
                                config: {
                                  driver: "gpu.nvidia.com",
                                  parameters: {
                                    ...(gpu.config as any)?.parameters,
                                    sharing: {
                                      ...(gpu.config as any)?.parameters
                                        ?.sharing,
                                      mps: {
                                        ...(gpu.config as any)?.parameters
                                          ?.sharing?.mps,
                                        defaultActiveThreadPercentage: Number(
                                          e.target.value
                                        ),
                                      },
                                    },
                                  },
                                },
                              })
                            }
                          />

                          <TextField
                            label="Default Pinned Device Memory Limit"
                            value={
                              (
                                gpu.config as any
                              )?.parameters?.sharing?.mps?.defaultPinnedDeviceMemoryLimit?.toString() ??
                              ""
                            }
                            onChange={(e) =>
                              updateRequested(idx, {
                                config: {
                                  driver: "gpu.nvidia.com",
                                  parameters: {
                                    ...(gpu.config as any)?.parameters,
                                    sharing: {
                                      ...(gpu.config as any)?.parameters
                                        ?.sharing,
                                      mps: {
                                        ...(gpu.config as any)?.parameters
                                          ?.sharing?.mps,
                                        defaultPinnedDeviceMemoryLimit:
                                          e.target.value,
                                      },
                                    },
                                  },
                                },
                              })
                            }
                          />
                        </Stack>
                      ) : (
                        (gpu.config as any)?.parameters?.sharing?.strategy ==
                          "TimeSlicing" && (
                          <Typography>timeslicing TBD</Typography>
                        )
                      )}
                    </>
                  </>
                )}
              </Stack>
            </Stack>
          </Paper>
        );
      })}

      <Button
        variant="outlined"
        onClick={() =>
          onChange([
            ...value,
            {
              name: "",
              allocationMode: "All",
              deviceClassName: "nvidia.com/gpu",
            },
          ])
        }
      >
        Add GPU request
      </Button>
    </Stack>
  );
}
