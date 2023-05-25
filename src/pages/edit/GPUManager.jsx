import {
  Card,
  CardContent,
  CardHeader,
  Chip,
  Link,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import CopyToClipboard from "react-copy-to-clipboard";
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
                      marginLeft: ".5em",
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
            <CopyToClipboard text="sudo ubuntu-drivers install --gpgpu">
              <Tooltip title="Copy to clipboard">
              <span style={{ fontFamily: "monospace", fontWeight: "bold", cursor: "pointer" }}>
                sudo ubuntu-drivers install --gpgpu
              </span>
              </Tooltip>
            </CopyToClipboard>{" "}
            can be used to install drivers.{" "}
            <Link
              href="https://help.ubuntu.com/community/NvidiaDriversInstallation"
              target="_blank"
              rel="noreferrer"
            >
              Learn more
            </Link>
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};
