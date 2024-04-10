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
import { useState } from "react";
import LoadingPage from "../../components/LoadingPage";
import Page from "../../components/Page";
import { errorHandler } from "../../utils/errorHandler";
import Profile from "../profile";
import CreateDeployment from "../create/CreateDeployment";
import CreateVm from "../create/CreateVm";
import { useNavigate } from "react-router-dom";
import useResource from "../../hooks/useResource";
import { useTranslation } from "react-i18next";
import { updateUserData } from "../../api/deploy/userData";
import { UserDataRead } from "kthcloud-types/types/v1/body";

export const Onboarding = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // user profile
  const { initialized, keycloak } = useKeycloak();
  const { initialLoad, user, setUser } = useResource();

  const cards: string[] = [
    "welcome",
    "profile",
    "resources",
    "deployments",
    "vms",
    "gpu",
    "finish",
  ];

  type CardTitles = Record<string, string>;

  const cardTitles: CardTitles = {
    welcome: t("onboarding-welcome"),
    profile: t("onboarding-profile"),
    resources: t("onboarding-resources"),
    deployments: t("onboarding-deployments"),
    vms: t("onboarding-vms"),
    gpu: t("onboarding-gpu"),
    finish: t("onboarding-finish"),
  };

  // Selected card
  const [selected, setSelected] = useState("welcome");
  const [lastAction, setLastAction] = useState("next");
  const [lastDismissed, setLastDismissed] = useState("");
  const [finished, setFinished] = useState(false);
  const [takingTooLong, setTakingTooLong] = useState(false);

  const timeOut = 150;

  const onboard = async () => {
    if (!(initialized && keycloak.token && user)) return;
    try {
      const response: UserDataRead = await updateUserData(
        keycloak.token,
        "onboarded",
        "true"
      );
      if (response) {
        let data: UserDataRead[];
        if (user && user.userData && user.userData.length > 0) {
          data = user.userData.map((data) => {
            if (data.id === "onboarded") {
              return response;
            }
            return data;
          });
        } else {
          data = [response];
        }
        setUser({ ...user, userData: data });
        navigate("/deploy", { replace: true });
      }
    } catch (error: any) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar(t("could-not-fetch-profile") + e, {
          variant: "error",
        })
      );
    }
  };

  const finalize = () => {
    setSelected("finish");
    setFinished(true);
    onboard();

    setTimeout(() => {
      // if onboard fails, show error message
      setTakingTooLong(true);
    }, 5000);

    setTimeout(() => {
      // navigate to deploy page anyway
      // if the page pathname still starts with /onboarding
      if (window.location.pathname.startsWith("/onboarding"))
        navigate("/deploy", { replace: true });
    }, 7000);
  };

  const nextCard = () => {
    if (selected === cards[cards.length - 1]) {
      finalize();
      return;
    }

    setLastDismissed(selected);
    setLastAction("next");
    // allow 200 ms for card to disappear
    setTimeout(() => {
      const index = cards.indexOf(selected);
      setSelected(cards[index + 1]);
    }, timeOut + 50);
  };

  const previousCard = () => {
    setLastDismissed(selected);
    setLastAction("previous");
    // allow 200 ms for card to disappear
    setTimeout(() => {
      const index = cards.indexOf(selected);
      setSelected(cards[index - 1]);
    }, timeOut + 50);
  };

  // take title and children as prop, put children in card content
  type OnboardingCardProps = {
    id: string;
    subheader?: string;
    children: React.ReactNode;
  };
  const OnboardingCard = ({ id, subheader, children }: OnboardingCardProps) => {
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
          {id !== "welcome" && (
            <Button variant="outlined" onClick={previousCard}>
              {t("previous")}
            </Button>
          )}
          <div style={{ flexGrow: "1" }} />

          <Button variant="contained" onClick={nextCard}>
            {selected === cards[cards.length - 1] ? t("finish") : t("next")}
          </Button>
        </CardActions>
      </Card>
    );
  };

  const renderCardDirection = (id: string) => {
    if (lastAction === "next") {
      if (id === lastDismissed) return "right";
      return "left";
    } else {
      if (id === lastDismissed) return "left";
      return "right";
    }
  };

  return (
    <>
      {!(initialLoad && user) ? (
        <LoadingPage />
      ) : (
        <Page title={t("getting-started")}>
          <Fade in={!finished} mountOnEnter unmountOnExit>
            <Container maxWidth={"md"}>
              <Stack spacing={3}>
                <Stack direction="row" justifyContent={"space-between"}>
                  <Typography variant="h4">{t("getting-started")}</Typography>

                  <div style={{ flexGrow: "1" }} />
                  <Button variant="text" onClick={() => finalize()}>
                    {t("skip")}
                  </Button>
                </Stack>

                <LinearProgress
                  variant="determinate"
                  value={
                    finished
                      ? 100
                      : (cards.findIndex((s) => s === selected) /
                          cards.length) *
                        100
                  }
                  sx={{
                    display: {
                      xs: "inline-flex",
                      sm: "inline-flex",
                      md: "none",
                    },
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
                        {cardTitles[label].includes(":")
                          ? cardTitles[label].split(":")[1]
                          : cardTitles[label]}
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
                        in={
                          selected === "welcome" &&
                          "welcome" !== lastDismissed &&
                          !finished
                        }
                        mountOnEnter
                        unmountOnExit
                      >
                        <div>
                          <OnboardingCard id={"welcome"}>
                            <Typography variant="body1" gutterBottom mb={3}>
                              {t("onboarding-welcome-1")}
                            </Typography>

                            <Typography variant="body1" gutterBottom>
                              {t("onboarding-welcome-2")}
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
                        in={
                          selected === "profile" &&
                          "profile" !== lastDismissed &&
                          !finished
                        }
                        mountOnEnter
                        unmountOnExit
                      >
                        <div>
                          <OnboardingCard id={"profile"}>
                            <Typography variant="body1" gutterBottom mb={3}>
                              {t("onboarding-profile-1")}
                            </Typography>

                            <Typography variant="body1" gutterBottom mb={3}>
                              {t("onboarding-profile-2")}
                            </Typography>
                          </OnboardingCard>
                        </div>
                      </Fade>
                    </div>
                  </Slide>

                  <Slide
                    timeout={timeOut}
                    direction={renderCardDirection("resources")}
                    in={
                      selected === "resources" && "resources" !== lastDismissed
                    }
                    mountOnEnter
                    unmountOnExit
                  >
                    <div>
                      <Fade
                        timeout={timeOut}
                        direction={renderCardDirection("resources")}
                        in={
                          selected === "resources" &&
                          "resources" !== lastDismissed &&
                          !finished
                        }
                        mountOnEnter
                        unmountOnExit
                      >
                        <div>
                          <OnboardingCard id={"resources"}>
                            <Typography variant="body1" gutterBottom mb={3}>
                              {t("onboarding-resources-1")}
                            </Typography>

                            <Typography variant="body1" gutterBottom mb={3}>
                              {t("onboarding-resources-2")}
                            </Typography>

                            <Typography variant="body1" gutterBottom mb={3}>
                              {t("onboarding-resources-3")}
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
                          "deployments" !== lastDismissed &&
                          !finished
                        }
                        mountOnEnter
                        unmountOnExit
                      >
                        <div>
                          <OnboardingCard id={"deployments"}>
                            <Typography variant="body1" gutterBottom mb={3}>
                              {t("onboarding-deployments-1")}
                            </Typography>

                            <Typography variant="body1" gutterBottom mb={3}>
                              {t("onboarding-deployments-2")}
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
                        in={
                          selected === "vms" &&
                          "vms" !== lastDismissed &&
                          !finished
                        }
                        mountOnEnter
                        unmountOnExit
                      >
                        <div>
                          <OnboardingCard id={"vms"}>
                            <Typography variant="body1" gutterBottom mb={3}>
                              {t("onboarding-vms-1")}
                            </Typography>

                            <Typography variant="body1" gutterBottom mb={3}>
                              {t("onboarding-vms-2")}
                            </Typography>

                            <Typography variant="body1" gutterBottom mb={3}>
                              {t("onboarding-vms-3")}
                            </Typography>
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
                        in={
                          selected === "gpu" &&
                          "gpu" !== lastDismissed &&
                          !finished
                        }
                        mountOnEnter
                        unmountOnExit
                      >
                        <div>
                          <OnboardingCard id={"gpu"}>
                            <Typography variant="body1" gutterBottom mb={3}>
                              {t("onboarding-gpu-1")}
                            </Typography>

                            <Typography variant="body1" gutterBottom mb={3}>
                              {t("onboarding-gpu-2")}
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
                        in={
                          selected === "finish" &&
                          "finish" !== lastDismissed &&
                          !finished
                        }
                        mountOnEnter
                        unmountOnExit
                      >
                        <div>
                          <OnboardingCard id={"finish"}>
                            <Typography variant="body1" gutterBottom mb={3}>
                              {t("onboarding-finish-1")}
                            </Typography>

                            <Typography variant="body1" gutterBottom mb={3}>
                              {t("onboarding-finish-2")}
                            </Typography>

                            <Typography variant="caption" gutterBottom mb={3}>
                              {t("onboarding-finish-3")}
                            </Typography>
                          </OnboardingCard>
                        </div>
                      </Fade>
                    </div>
                  </Slide>
                </Stack>
              </Stack>
            </Container>
          </Fade>

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
                width: "90%",
                maxWidth: "md",
                height: "100%",
              }}
            />

            <Fade
              in={
                selected === "profile" &&
                "profile" !== lastDismissed &&
                !finished
              }
              mountOnEnter
              unmountOnExit
            >
              <div>
                <Profile user={user} />
              </div>
            </Fade>

            <Fade
              in={
                selected === "deployments" &&
                "deployments" !== lastDismissed &&
                !finished
              }
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
              in={selected === "vms" && "vms" !== lastDismissed && !finished}
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

          <Fade in={finished} mountOnEnter unmountOnExit>
            <Container maxWidth="sm">
              <Card
                sx={{
                  boxShadow: 20,
                  background: "#1b2842",
                  color: "#ffffff",
                  maxWidth: "sm",
                }}
              >
                <CardHeader title={"Finishing up..."} />
                <CardContent>
                  <Typography variant="body1" gutterBottom mb={3}>
                    {t("onboarding-wait-1")}
                  </Typography>
                  {takingTooLong && (
                    <Typography variant="body1" gutterBottom mb={3}>
                      {t("onboarding-wait-2")}
                    </Typography>
                  )}
                  <LinearProgress />
                </CardContent>
              </Card>
            </Container>
          </Fade>
        </Page>
      )}
    </>
  );
};
