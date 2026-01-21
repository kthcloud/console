import { useState } from "react";
import { Stack, Typography, Button, Alert, Box } from "@mui/material";
import GpuClaimModal from "./GPUClaimModal";
import { GpuClaimCreate, GpuClaimRead } from "../../temporaryTypesRemoveMe";
import { createGpuClaim } from "../../api/deploy/gpuClaims";
import { useKeycloak } from "@react-keycloak/web";
import { enqueueSnackbar } from "notistack";
import useAdmin from "../../hooks/useAdmin";

interface DRAConfigPanelProps {
  zone: {
    name: string;
    // extend later with draResources, policies, etc
  };
  roles: string[];
}

export default function DRAConfigPanel({ zone, roles }: DRAConfigPanelProps) {
  const [gpuModalOpen, setGpuModalOpen] = useState(false);
  const { gpuClaims } = useAdmin();
  const { keycloak } = useKeycloak();

  const handleAddGpuClaim = async (claim: GpuClaimCreate) => {
    try {
      const response = await createGpuClaim(keycloak.token!, claim);
      if (response["validationErrors"] != undefined) {
        throw response["validationErrors"];
      }
      setGpuModalOpen(false);
    } catch (ex) {
      enqueueSnackbar<"error">({ message: "Failed to create gpu claim" + ex });
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2" fontWeight={600}>
        Dynamic Resource Allocation (DRA)
      </Typography>

      <Alert severity="info">
        This zone supports Dynamic Resource Allocation. Configure DRA resources
        and policies below.
      </Alert>

      <Box
        sx={{
          border: "1px dashed",
          borderColor: "divider",
          borderRadius: 1,
          p: 2,
        }}
      >
        <Stack spacing={1}>
          {gpuClaims?.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No DRA resources configured yet.
            </Typography>
          ) : (
            <Stack spacing={1}>
              {gpuClaims?.map((claim) => (
                <Box
                  key={claim.name}
                  sx={{
                    p: 1,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                  }}
                >
                  <Typography fontWeight={600}>{claim.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Zone: {claim.zone}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Allowed roles: {claim.allowedRoles?.join(", ") || "All"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Requested GPUs:{" "}
                    {Object.keys(claim.requested || {}).join(", ")}
                  </Typography>
                </Box>
              ))}
            </Stack>
          )}

          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="contained"
              onClick={() => setGpuModalOpen(true)}
            >
              Add DRA Resource
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* GPU Claim Modal */}
      <GpuClaimModal
        open={gpuModalOpen}
        zone={zone.name}
        roles={roles}
        onClose={() => setGpuModalOpen(false)}
        onSubmit={handleAddGpuClaim}
      />
    </Stack>
  );
}
