import { faker } from "@faker-js/faker";
import { sample } from "lodash";

// ----------------------------------------------------------------------

const deployments = [...Array(24)].map((_, index) => ({
  id: faker.datatype.uuid(),
  status: sample(["running", "stopped", "error"]),
  name: sample([
    "ramp2-backend",
    "ramp-auth",
    "ramp2-frontend",
    "ramp1-backend",
    "jupyter",
  ]),
  type: sample([
    "Kubernetes Production",
    "Kubernetes Development",
    "Virtual server - GPU Small",
    "Virtual server - GPU Large",
  ]),
}));

export default deployments;
