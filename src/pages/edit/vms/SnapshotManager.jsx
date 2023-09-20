import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { useKeycloak } from "@react-keycloak/web";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { getSnapshots, createSnapshot, updateVM } from "src/api/deploy/vms";
import ConfirmButton from "src/components/ConfirmButton";
import Iconify from "src/components/Iconify";
import RFC1035Input from "src/components/RFC1035Input";
import useResource from "src/hooks/useResource";
import { errorHandler } from "src/utils/errorHandler";

export default function Specs({ vm }) {
  const { initialized, keycloak } = useKeycloak();
  const { queueJob } = useResource();

  const [initialLoad, setInitialLoad] = useState(false);
  const [snapshots, setSnapshots] = useState([]);
  const [snapshotName, setSnapshotName] = useState("");
  const [selectedSnapshot, setSelectedSnapshot] = useState("");

  const loadVMSnapshots = async () => {
    if (!initialized) return -1;

    try {
      const response = await getSnapshots(vm.id, keycloak.token);

      if (response.length === 0) return;

      response.reverse();
      setSnapshots(response);
      if (!initialLoad) setSelectedSnapshot(response.find((s) => s.current).id);
    } catch (error) {
      console.error("Error fetching snapshots: " + error);
    } finally {
      setInitialLoad(true);
    }
  };

  const createVMSnapshot = async (name) => {
    if (!initialized) return -1;

    try {
      setSnapshotName("");
      const response = await createSnapshot(vm.id, name, keycloak.token);
      queueJob(response);
      enqueueSnackbar("Creating snapshot", {
        variant: "success",
      });
    } catch (error) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar("Error creating snapshot: " + e, {
          variant: "error",
        })
      );
    }
  };

  const revertVMSnapshot = async (snapshot) => {
    if (!initialized) return -1;

    const update = { snapshotId: snapshot };

    try {
      const response = await updateVM(vm.id, update, keycloak.token);
      queueJob(response);
      enqueueSnackbar("VM reverting to snapshot", {
        variant: "success",
      });
    } catch (error) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar("Error reverting VM to snapshot: " + e, {
          variant: "error",
        })
      );
    }
  };

  useEffect(() => {
    if (vm) {
      loadVMSnapshots();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vm, initialized]);

  if (!initialLoad)
    return (
      <Card sx={{ boxShadow: 20 }}>
        <CardHeader title={"Snapshots"} />
        <CardContent>
          <CircularProgress />
        </CardContent>
      </Card>
    );

  return (
    <Card sx={{ boxShadow: 20 }}>
      <CardHeader
        title={"Snapshots"}
        subheader={
          "Snapshots allow you to save the state of the virtual machine at a point in time. You can revert to that state at any time"
        }
      />
      <CardContent>
          <Stack spacing={2} direction={"column"}>
            {snapshots.length > 0 && (
              <>
                <Typography variant="body">Your snapshots ({snapshots.length})</Typography>
                <Stack
                  spacing={2}
                  direction={"row"}
                  flexWrap={"wrap"}
                  useFlexGap={true}
                  alignItems={"center"}
                >
                  <Select
                    value={selectedSnapshot}
                    onChange={(e) => setSelectedSnapshot(e.target.value)}
                  >
                    {snapshots &&
                      snapshots.map((snapshot) => (
                        <MenuItem value={snapshot.id} key={snapshot.id}>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            spacing={3}
                          >
                            <Typography variant={"body1"}>
                              {snapshot.displayname}
                            </Typography>
                            {snapshot.current && <Chip label={"Latest"} />}
                          </Stack>
                        </MenuItem>
                      ))}
                  </Select>
                  <ConfirmButton
                    action="Revert"
                    actionText="revert to this snapshot"
                    callback={() => revertVMSnapshot(selectedSnapshot)}
                    props={{
                      color: "error",
                      variant: "contained",
                      startIcon: <Iconify icon="dashicons:backup" />,
                    }}
                  />
                </Stack>
                <br />
              </>
            )}

            <Typography variant="body">Create new snapshot</Typography>

            <Stack
              spacing={2}
              direction={"row"}
              flexWrap={"wrap"}
              useFlexGap={true}
              alignItems={"center"}
            >
              <RFC1035Input
                label="Snapshot Name"
                type="Snapshot Name"
                cleaned={snapshotName}
                setCleaned={setSnapshotName}
                initialValue={snapshotName}
                callToAction="Your snapshot will be created as"
              />

              <Button
                variant="contained"
                color="primary"
                onClick={() => createVMSnapshot(snapshotName)}
                startIcon={<Iconify icon="material-symbols:save" />}
              >
                Create
              </Button>
            </Stack>
          </Stack>
      </CardContent>
    </Card>
  );
}
