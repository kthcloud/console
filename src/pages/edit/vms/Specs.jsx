import { Card, CardContent, CardHeader, Chip, Stack } from "@mui/material";
import Iconify from "src/components/Iconify";

export default function Specs({vm}) {

    return (<Card sx={{ boxShadow: 20 }}>
        <CardHeader title={"Specs"} />
        <CardContent>
          <Stack spacing={3} direction={"row"} flexWrap={"wrap"} useFlexGap={true}>
            <Chip
              m={1}
              icon={
                <Iconify icon="uil:processor" width={24} height={24} />
              }
              label={
                <span>
                  CPU Cores
                  <b
                    style={{
                      fontFamily: "monospace",
                      marginLeft: ".75em",
                    }}
                  >
                    {vm.specs.cpuCores}
                  </b>
                </span>
              }
            />
            <Chip
              m={1}
              icon={<Iconify icon="bi:memory" width={24} height={24} />}
              label={
                <span>
                  Memory 
                  <b
                    style={{
                      fontFamily: "monospace",
                      marginLeft: ".75em",
                    }}
                  >
                    {vm.specs.ram + " GB"}
                  </b>
                </span>
              }
            />
            <Chip
              m={1}
              icon={
                <Iconify icon="mdi:harddisk" width={24} height={24} />
              }
              label={
                <span>
                  Disk
                  <b
                    style={{
                      fontFamily: "monospace",
                      marginLeft: ".75em",
                    }}
                  >
                    {vm.specs.diskSize + " GB"}
                  </b>
                </span>
              }
            />
            <Chip
              m={1}
              icon={
                <Iconify icon="material-symbols:speed-outline" width={24} height={24} />
              }
              label={
                <span>
                  Network Speed
                  <b
                    style={{
                      fontFamily: "monospace",
                      marginLeft: ".75em",
                    }}
                  >
                    {"1000 Mbps"}
                  </b>
                </span>
              }
            />
          </Stack>
        </CardContent>
      </Card>)
}