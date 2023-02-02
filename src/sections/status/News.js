// keycloak
import { useKeycloak } from "@react-keycloak/web";
// @mui
import PropTypes from "prop-types";
import {
  Box,
  IconButton,
  Grid,
  Stack,
  Link,
  Card,
  Typography,
  CardHeader,
} from "@mui/material";
// utils
import { fToNow } from "../../utils/formatTime";
// components
import Iconify from "../../components/Iconify";
import Scrollbar from "../../components/Scrollbar";
// hooks
import useAlert from "src/hooks/useAlert";
// ----------------------------------------------------------------------
// material
// import { styled } from "@mui/material/styles";
// import { OutlinedInput, InputAdornment } from "@mui/material";
import { useEffect, useState } from "react";
import CreateNews from "src/sections/status/CreateNews";

News.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
  list: PropTypes.array.isRequired,
};

// Used for mailing list sign up form
// const SearchStyle = styled(OutlinedInput)(({ theme }) => ({
//   width: 240,
//   marginRight: 16,
//   transition: theme.transitions.create(["box-shadow", "width"], {
//     easing: theme.transitions.easing.easeInOut,
//     duration: theme.transitions.duration.shorter,
//   }),
//   "&.Mui-focused": { boxShadow: theme.customShadows.z8 },
//   "& fieldset": {
//     borderWidth: `1px !important`,
//     borderColor: `${theme.palette.grey[500_32]} !important`,
//   },
// }));

async function createNews(title, content, image, token) {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("description", content);
  formData.append("image", image);

  return fetch(process.env.REACT_APP_API_URL + "/landing/v1/news", {
    method: "POST",
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw response;
    })
    .catch((error) => {
      console.error("Error:", error);
      throw error;
    });
}

function deleteNews(id, token) {
  return fetch(process.env.REACT_APP_API_URL + `/landing/v1/news/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw response;
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      throw error;
    });
}

export default function News({
  title,
  subheader,
  list,
  onCreate,
  onDelete,
  ...other
}) {
  // const [email, setEmail] = useState("");
  const [canManageNews, setCanManageNews] = useState(false);
  const { keycloak, initialized } = useKeycloak();
  const { setAlert } = useAlert();

  useEffect(() => {
    if (initialized && keycloak.authenticated) {
      keycloak
        .loadUserInfo()
        .then((userInfo) => {
          setCanManageNews(
            keycloak.authenticated &&
              userInfo.groups.some((item) => item === "/admin")
          );
        })
        .catch((err) => {
          console.error(err);
        });
    }
  });

  return (
    <Card {...other}>
      <CardHeader
        title={
          <>
            <Grid container justifyContent="space-between">
              <Grid item>{title}</Grid>
              {canManageNews ? (
                <Grid item>
                  <CreateNews
                    onCreate={(title, content, image) => {
                      return createNews(title, content, image, keycloak.token)
                        .then((result) => {
                          setAlert("Sucessfully created news", "success");
                          onCreate({
                            id: result.id,
                            postedAt: result.postedAt,
                            title: title,
                            content: content,
                            image: image,
                          });
                        })
                        .catch((err) => {
                          if (err.status === 400) {
                            setAlert(
                              "Failed to create news: invalid input",
                              "error"
                            );
                          } else {
                            console.error(err);
                            setAlert("Failed to create news. ", "error");
                          }
                          throw err;
                        });
                    }}
                  />
                </Grid>
              ) : (
                <></>
              )}
            </Grid>
          </>
        }
        subheader={subheader}
      ></CardHeader>

      <Scrollbar>
        <Stack spacing={3} sx={{ p: 3, pr: 0 }}>
          {list.map((news) => (
            <NewsItem
              key={news.id}
              news={news}
              canManageNews={canManageNews}
              onDelete={(id) => {
                return deleteNews(id, keycloak.token)
                  .then(() => {
                    onDelete(id);
                  })
                  .catch((e) => {
                    console.error(e);
                    setAlert("Failed to delete news. ", "error");
                  });
              }}
            />
          ))}
        </Stack>
      </Scrollbar>

      {/* Sign up form for mailing list */}
      {/* <Divider />

      <Stack direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={2} sx={{ px: 3, py: 2 }}>

        <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
          Sign up to get news and outage notifications
        </Typography>
        <Box sx={{ flexGrow: 1 }} />

        <SearchStyle
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          startAdornment={
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled', width: 20, height: 20 }} />
            </InputAdornment>
          }
        />
        <Button size="large" color="inherit" endIcon={<Iconify icon={'eva:arrow-ios-forward-fill'} />}>
          Sign up
        </Button>
      </Stack> */}
    </Card>
  );
}

// ----------------------------------------------------------------------

NewsItem.propTypes = {
  news: PropTypes.shape({
    description: PropTypes.string,
    image: PropTypes.string,
    // postedAt: PropTypes.instanceOf(Date),
    postedAt: PropTypes.string,
    title: PropTypes.string,
  }),
};

function NewsItem({ news, canManageNews, onDelete }) {
  const { id, image, title, content, postedAt } = news;

  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      {image ? (
        <Box
          component="img"
          alt={title}
          src={`data:image/jpeg;base64,${image}`}
          sx={{ width: 48, height: 48, borderRadius: 1.5, flexShrink: 0 }}
        />
      ) : (
        <Box
          component="img"
          alt={title}
          src={"/static/icons/no-image.png"}
          sx={{ width: 48, height: 48, borderRadius: 1.5, flexShrink: 0 }}
        />
      )}

      <Box sx={{ minWidth: "40%", maxWidth: "50%" }}>
        <Link color="inherit" variant="subtitle2" underline="hover" noWrap>
          {title}
        </Link>

        <Typography variant="body2" sx={{ color: "text.secondary" }} noWrap>
          {content}
        </Typography>
      </Box>

      <Grid
        container
        alignItems="center"
        display="flex"
        justifyContent={"end"}
        sx={{ pl: 3 }}
      >
        <Typography
          variant="caption"
          sx={{ pr: 3, flexShrink: 0, color: "text.secondary" }}
        >
          {fToNow(postedAt)}
        </Typography>

        {canManageNews ? (
          <Box sx={{ pr: 3 }}>
            <IconButton onClick={() => onDelete(id)}>
              <Iconify
                sx={{ color: "error.main" }}
                icon={"eva:trash-2-outline"}
              />
            </IconButton>
          </Box>
        ) : (
          <></>
        )}
      </Grid>
    </Stack>
  );
}
