import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { TreeItem, TreeView } from "@mui/x-tree-view";
import { useKeycloak } from "@react-keycloak/web";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { getSnapshots, createSnapshot, updateVM } from "src/api/deploy/vms";
import ConfirmButton from "src/components/ConfirmButton";
import Iconify from "src/components/Iconify";
import RFC1035Input from "src/components/RFC1035Input";
import useResource from "src/hooks/useResource";
import { errorHandler } from "src/utils/errorHandler";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

export default function Specs({ vm }) {
  const { initialized, keycloak } = useKeycloak();
  const { queueJob } = useResource();

  const [initialLoad, setInitialLoad] = useState(false);
  const [snapshots, setSnapshots] = useState([]);
  const [snapshotName, setSnapshotName] = useState("");
  const [selectedSnapshot, setSelectedSnapshot] = useState("");

  // Treeview
  const [expanded, setExpanded] = useState([]);

  const handleToggle = (event, nodeIds) => {
    setExpanded(nodeIds);
  };

  const handleSelect = (event, nodeIds) => {
    setSelectedSnapshot(nodeIds.slice(-1)[0]);
  };

  // Load resources
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

  function getSnapshotLabel(snapshot) {
    return (
      <Stack direction={"row"} spacing={2} alignItems={"center"}>
        <Typography variant={"body1"}>{snapshot.displayname}</Typography>
        {snapshot.current && <Chip label={"Latest"} />}
      </Stack>
    );
  }

  function getSnapshotChildren(snapshot) {
    return snapshots
      .filter((s) => s.parentName === snapshot.displayname)
      .map((child) => (
        <TreeItem
          nodeId={child.id}
          label={getSnapshotLabel(child)}
          key={child.id}
        >
          {getSnapshotChildren(child)}
        </TreeItem>
      ));
  }

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
        <Stack spacing={2} direction={"column"} w={100}>
          {snapshots.length > 0 && (
            <>
              <Typography variant="body">
                Your snapshots ({snapshots.length})
              </Typography>
              <Stack
                spacing={2}
                direction={"row"}
                flexWrap={"wrap"}
                useFlexGap={true}
                alignItems={"center"}
                justifyContent={"space-between"}
                maxWidth={800}
              >
                <TreeView
                  aria-label="controlled"
                  defaultCollapseIcon={<ExpandMoreIcon />}
                  defaultExpandIcon={<ChevronRightIcon />}
                  expanded={expanded}
                  selected={selectedSnapshot}
                  onNodeToggle={handleToggle}
                  onNodeSelect={handleSelect}
                  multiSelect
                >
                  {snapshots
                    .filter((s) => !s.parentName)
                    .map((snapshot) => (
                      <TreeItem
                        nodeId={snapshot.id}
                        label={getSnapshotLabel(snapshot)}
                        key={snapshot.id}
                      >
                        {getSnapshotChildren(snapshot)}
                      </TreeItem>
                    ))}
                </TreeView>

                <Stack
                  direction={"column"}
                  justifyContent={"space-between"}
                  alignItems={"center"}
                  spacing={2}
                  sx={{
                    border: 1,
                    p: 2,
                    borderRadius: 1,
                    borderColor: "#ff534c",
                  }}
                  useFlexGap
                  boxShadow={10}
                >
                  <Typography variant="body">Selected snapshot</Typography>
                  <Typography variant="body2">
                    {snapshots.find((s) => s.id === selectedSnapshot) &&
                      snapshots.find((s) => s.id === selectedSnapshot)
                        .displayname
                    }
                  </Typography>
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
