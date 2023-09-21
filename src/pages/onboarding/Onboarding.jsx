import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Container,
  Fade,
  LinearProgress,
  Slide,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import { useKeycloak } from "@react-keycloak/web";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { getUser } from "src/api/deploy/users";
import LoadingPage from "src/components/LoadingPage";
import Page from "src/components/Page";
import { errorHandler } from "src/utils/errorHandler";
import Profile from "../profile";
import CreateDeployment from "../create/CreateDeployment";
import CreateVm from "../create/CreateVm";

export const Onboarding = () => {
  // user profile
  const { keycloak, initialized } = useKeycloak();
  const [user, setUser] = useState(null);
  const loadProfile = async () => {
    if (!initialized) return -1;

    try {
      const response = await getUser(keycloak.subject, keycloak.token);
      setUser(response);
    } catch (error) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar("Could not fetch profile: " + e, {
          variant: "error",
        })
      );
    }
  };

  // Run once on load
  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cards = [
    "welcome",
    "profile",
    "resources",
    "deployments",
    "vms",
    "gpu",
    "finish",
  ];

  const cardTitles = {
    welcome: "Welcome to kthcloud!",
    profile: "Your profile",
    resources: "Resources on kthcloud",
    deployments: "Resource type: Deployments",
    vms: "Resource type: Virtual Machines",
    gpu: "GPU",
    finish: "Let's go!",
  };

  // Selected card
  const [selected, setSelected] = useState("welcome");
  const [lastAction, setLastAction] = useState("next");
  const [lastDismissed, setLastDismissed] = useState("");

  const timeOut = 150;

  const nextCard = () => {
    setLastDismissed(selected);
    setLastAction("next");
    // allow 200 ms for card to disappear
    setTimeout(() => {
      const index = cards.indexOf(selected);
      // skip GPU if user.role.permissions does not include "useGpus"
      if (selected === "vms" && !user.role.permissions.includes("useGpus"))
        setSelected(cards[index + 2]);
      else setSelected(cards[index + 1]);
    }, timeOut + 50);
  };

  const previousCard = () => {
    setLastDismissed(selected);
    setLastAction("previous");
    // allow 200 ms for card to disappear
    setTimeout(() => {
      const index = cards.indexOf(selected);
      // skip GPU if user.role.permissions does not include "useGpus"
      if (selected === "vms" && !user.role.permissions.includes("useGpus"))
        setSelected(cards[index - 2]);
      else setSelected(cards[index - 1]);
    }, timeOut + 50);
  };

  // take title and children as prop, put children in card content
  const OnboardingCard = ({ id, subheader, children }) => {
    return (
      <Card
        sx={{
          boxShadow: 20,
          background: "#1b2842",
          color: "#ffffff",
          maxWidth: "sm",
        }}
      >
        <CardHeader title={cardTitles[id]} subheader={subheader} />
        <CardContent>{children}</CardContent>
        <CardActions>
          <div style={{ flexGrow: "1" }} />
          {id !== "welcome" && (
            <Button variant="outlined" onClick={previousCard}>
              Previous
            </Button>
          )}
          <Button variant="contained" onClick={nextCard}>
            {selected === cards[cards.length - 1] ? "Finish" : "Next"}
          </Button>
        </CardActions>
      </Card>
    );
  };

  const renderCardDirection = (id) => {
    if (lastAction === "next") {
      if (id === lastDismissed) return "left";
      return "right";
    } else {
      if (id === lastDismissed) return "right";
      return "left";
    }
  };

  return (
    <>
      {!user ? (
        <LoadingPage />
      ) : (
        <Page title="Getting started">
          <Container maxWidth={"md"}>
            <Stack spacing={3}>
              <Stack direction="row" justifyContent={"space-between"}>
                <Typography variant="h4">Getting started</Typography>

                <div style={{ flexGrow: "1" }} />
                <Button variant="text">Skip</Button>
              </Stack>

              <LinearProgress
                variant="determinate"
                value={
                  (cards.findIndex((s) => s === selected) / cards.length) * 100
                }
                sx={{
                  display: { xs: "inline-flex", sm: "inline-flex", md: "none" },
                }}
              />

              <Stepper
                activeStep={cards.findIndex((s) => s === selected)}
                alternativeLabel
                sx={{
                  display: { xs: "none", sm: "none", md: "inline-flex" },
                }}
              >
                {cards.map((label, index) => (
                  <Step
                    key={label + index}
                    completed={cards.indexOf(selected) >= index}
                  >
                    <StepLabel color="inherit">
                      {cardTitles[label].replace("Resource type: ", "")}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>

              <Stack spacing={3} alignItems={"center"}>
                <Slide
                  timeout={timeOut}
                  direction={renderCardDirection("welcome")}
                  in={selected === "welcome" && "welcome" !== lastDismissed}
                  mountOnEnter
                  unmountOnExit
                >
                  <div>
                    <Fade
                      timeout={timeOut}
                      direction={renderCardDirection("welcome")}
                      in={selected === "welcome" && "welcome" !== lastDismissed}
                      mountOnEnter
                      unmountOnExit
                    >
                      <div>
                        <OnboardingCard id={"welcome"}>
                          <Typography variant="body1" gutterBottom mb={3}>
                            We're thrilled you want to try out kthcloud! This is
                            a quick guide to get you started.
                          </Typography>

                          <Typography variant="body1" gutterBottom>
                            We offer a cutting-edge private cloud infrastructure
                            tailored to meet the unique needs of KTH's bright
                            minds. Seamlessly run experiments, collaborate on
                            groundbreaking research, and harness the power of
                            cloud technology to drive innovation.
                          </Typography>
                        </OnboardingCard>
                      </div>
                    </Fade>
                  </div>
                </Slide>

                <Slide
                  timeout={timeOut}
                  direction={renderCardDirection("profile")}
                  in={selected === "profile" && "profile" !== lastDismissed}
                  mountOnEnter
                  unmountOnExit
                >
                  <div>
                    <Fade
                      timeout={timeOut}
                      direction={renderCardDirection("profile")}
                      in={selected === "profile" && "profile" !== lastDismissed}
                      mountOnEnter
                      unmountOnExit
                    >
                      <div>
                        <OnboardingCard id={"profile"}>
                          <Typography variant="body1" gutterBottom mb={3}>
                            Your profile is where you can find your personal
                            information and view your quotas.
                          </Typography>

                          <Typography variant="body1" gutterBottom mb={3}>
                            You can also find your SSH keys here. These keys
                            enable you to connect to your virtual machines.
                          </Typography>
                        </OnboardingCard>
                      </div>
                    </Fade>
                  </div>
                </Slide>

                <Slide
                  timeout={timeOut}
                  direction={renderCardDirection("resources")}
                  in={selected === "resources" && "resources" !== lastDismissed}
                  mountOnEnter
                  unmountOnExit
                >
                  <div>
                    <Fade
                      timeout={timeOut}
                      direction={renderCardDirection("resources")}
                      in={
                        selected === "resources" &&
                        "resources" !== lastDismissed
                      }
                      mountOnEnter
                      unmountOnExit
                    >
                      <div>
                        <OnboardingCard id={"resources"}>
                          <Typography variant="body1" gutterBottom mb={3}>
                            kthcloud resources are graciously provided by
                            researchers, the KTH IT department, KTH PDC and new
                            hardware is funded through the European Union's
                            Erasmus project.
                          </Typography>

                          <Typography variant="body1" gutterBottom mb={3}>
                            Keep in mind that kthcloud is a shared resource.
                            Please be considerate of your fellow students and
                            researchers and only use what you need.
                          </Typography>

                          <Typography variant="body1" gutterBottom mb={3}>
                            If you need more resources, please contact us on
                            Discord!
                          </Typography>
                        </OnboardingCard>
                      </div>
                    </Fade>
                  </div>
                </Slide>

                <Slide
                  timeout={timeOut}
                  direction={renderCardDirection("deployments")}
                  in={
                    selected === "deployments" &&
                    "deployments" !== lastDismissed
                  }
                  mountOnEnter
                  unmountOnExit
                >
                  <div>
                    <Fade
                      timeout={timeOut}
                      direction={renderCardDirection("deployments")}
                      in={
                        selected === "deployments" &&
                        "deployments" !== lastDismissed
                      }
                      mountOnEnter
                      unmountOnExit
                    >
                      <div>
                        <OnboardingCard id={"deployments"}>
                          <Typography variant="body1" gutterBottom mb={3}>
                            Deployments are the most common resource type on
                            kthcloud. They are a collection of virtual machines
                            that are automatically created and managed by
                            kthcloud.
                          </Typography>

                          <Typography variant="body1" gutterBottom mb={3}>
                            Deployments are perfect for running experiments,
                            hosting websites or running your own cloud services.
                          </Typography>

                          <Typography variant="body1" gutterBottom mb={3}>
                            All you need is a Docker image and a little bit of
                            configuration. kthcloud will take care of the rest.
                          </Typography>
                        </OnboardingCard>
                      </div>
                    </Fade>
                  </div>
                </Slide>

                <Slide
                  timeout={timeOut}
                  direction={renderCardDirection("vms")}
                  in={selected === "vms" && "vms" !== lastDismissed}
                  mountOnEnter
                  unmountOnExit
                >
                  <div>
                    <Fade
                      timeout={timeOut}
                      direction={renderCardDirection("vms")}
                      in={selected === "vms" && "vms" !== lastDismissed}
                      mountOnEnter
                      unmountOnExit
                    >
                      <div>
                        <OnboardingCard id={"vms"}>
                          <Typography variant="body1" gutterBottom mb={3}>
                            Virtual machines are the most flexible resource type
                            on kthcloud. You can install any operating system
                            you want and have full control over the machine.
                          </Typography>

                          <Typography variant="body1" gutterBottom mb={3}>
                            Virtual machines are perfect for running
                            experiments, hosting websites or running your own
                            cloud services.
                          </Typography>

                          {user.role.permissions.includes("useGpus") && (
                            <Typography variant="body1" gutterBottom mb={3}>
                              You can also request a GPU for your virtual
                              machine. Please note that GPU resources are
                              limited, for extended use you may want to provide
                              your own GPU.
                            </Typography>
                          )}
                        </OnboardingCard>
                      </div>
                    </Fade>
                  </div>
                </Slide>

                <Slide
                  timeout={timeOut}
                  direction={renderCardDirection("gpu")}
                  in={selected === "gpu" && "gpu" !== lastDismissed}
                  mountOnEnter
                  unmountOnExit
                >
                  <div>
                    <Fade
                      timeout={timeOut}
                      direction={renderCardDirection("gpu")}
                      in={selected === "gpu" && "gpu" !== lastDismissed}
                      mountOnEnter
                      unmountOnExit
                    >
                      <div>
                        <OnboardingCard id={"gpu"}>
                          <Typography variant="body1" gutterBottom mb={3}>
                            kthcloud provides access to top of the line GPUs
                            from NVIDIA. These GPUs are perfect for training
                            machine learning models.
                          </Typography>

                          <Typography variant="body1" gutterBottom mb={3}>
                            GPU resources are limited, for extended use you may
                            want to provide your own GPU.
                          </Typography>
                        </OnboardingCard>
                      </div>
                    </Fade>
                  </div>
                </Slide>

                <Slide
                  timeout={timeOut}
                  direction={renderCardDirection("finish")}
                  in={selected === "finish" && "finish" !== lastDismissed}
                  mountOnEnter
                  unmountOnExit
                >
                  <div>
                    <Fade
                      timeout={timeOut}
                      direction={renderCardDirection("finish")}
                      in={selected === "finish" && "finish" !== lastDismissed}
                      mountOnEnter
                      unmountOnExit
                    >
                      <div>
                        <OnboardingCard id={"finish"}>
                          <Typography variant="body1" gutterBottom mb={3}>
                            That's it! You're ready to start using kthcloud.
                          </Typography>

                          <Typography variant="body1" gutterBottom mb={3}>
                            If you have any questions, please contact us on
                            Discord.
                          </Typography>
                        </OnboardingCard>
                      </div>
                    </Fade>
                  </div>
                </Slide>
              </Stack>
            </Stack>
          </Container>

          <Container
            maxWidth={"md"}
            sx={{
              userSelect: "none",
              opacity: 0.5,
              mt: 10,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                zIndex: 100,
                position: "absolute",
                width: "100%",
                maxWidth: "md",
                height: "100%",
              }}
            />

            <Fade
              in={selected === "profile" && "profile" !== lastDismissed}
              mountOnEnter
              unmountOnExit
            >
              <div>
                <Profile user={user} />
              </div>
            </Fade>

            <Fade
              in={selected === "deployments" && "deployments" !== lastDismissed}
              mountOnEnter
              unmountOnExit
            >
              <div>
                <Stack spacing={3}>
                  <CreateDeployment />
                </Stack>
              </div>
            </Fade>

            <Fade
              in={selected === "vms" && "vms" !== lastDismissed}
              mountOnEnter
              unmountOnExit
            >
              <div>
                <Stack spacing={3}>
                  <CreateVm />
                </Stack>
              </div>
            </Fade>
          </Container>
        </Page>
      )}
    </>
  );
};
