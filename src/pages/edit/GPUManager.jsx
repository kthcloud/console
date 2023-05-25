import {
  Card,
  CardContent,
  CardHeader,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import Iconify from "src/components/Iconify";

export const GPUManager = ({ vm }) => {
  const date = new Date(vm.gpu.leaseEnd);
  const leaseEnd = date.toLocaleString(navigator.language);

  return (
    <Card sx={{ boxShadow: 20 }}>
      <CardHeader title={"GPU Lease"} />
      <CardContent>
        <Stack
          spacing={3}
          direction={"column"}
          flexWrap={"wrap"}
          useFlexGap={true}
        >
          <Stack
            spacing={3}
            direction={"row"}
            flexWrap={"wrap"}
            useFlexGap={true}
          >
            <Chip
              m={1}
              icon={<Iconify icon="mdi:gpu" width={24} height={24} />}
              label={vm.gpu ? "NVIDIA " + vm.gpu.name : "No GPU leased"}
            />
            <Chip
              m={1}
              icon={<Iconify icon="mdi:clock-outline" width={24} height={24} />}
              label={
                <span>
                  Leased until
                  <b
                    style={{
                      fontFamily: "monospace",
                      marginLeft: ".75em",
                    }}
                  >
                    {leaseEnd}
                  </b>
                </span>
              }
            />
          </Stack>

          <Typography variant="body2">
            Leasing a GPU will not install drivers or software. You will need to
            install the drivers and software yourself.
            <br />
            For Ubuntu VMs,{" "}
            <a
              href="https://help.ubuntu.com/community/NvidiaDriversInstallation"
              target="_blank"
              rel="noreferrer"
              style={{ fontFamily: "monospace" }}
            >
              sudo ubuntu-drivers install --gpgpu
            </a>{" "}
            can be used to install drivers.
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};
