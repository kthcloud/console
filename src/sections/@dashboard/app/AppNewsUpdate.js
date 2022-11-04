// keycloak
import { useKeycloak } from '@react-keycloak/web';
// @mui
import PropTypes from 'prop-types';
import { Box, Grid, Stack, Link, Card, Button, Divider, Typography, CardHeader } from '@mui/material';
// utils
import { fToNow } from '../../../utils/formatTime';
// components
import Iconify from '../../../components/Iconify';
import Scrollbar from '../../../components/Scrollbar';
// ----------------------------------------------------------------------
// material
import { styled } from '@mui/material/styles';
import { OutlinedInput, InputAdornment } from '@mui/material';
import { useEffect, useState } from 'react';
import NewsFormDialog from 'src/layouts/dashboard/NewsFormDialog';

AppNewsUpdate.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
  list: PropTypes.array.isRequired,
};

const SearchStyle = styled(OutlinedInput)(({ theme }) => ({
  width: 240,
  marginRight: 16,
  transition: theme.transitions.create(['box-shadow', 'width'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shorter,
  }),
  '&.Mui-focused': { boxShadow: theme.customShadows.z8 },
  '& fieldset': {
    borderWidth: `1px !important`,
    borderColor: `${theme.palette.grey[500_32]} !important`,
  },
}));


export default function AppNewsUpdate({ title, subheader, list, onCreate, ...other }) {
  const [email, setEmail] = useState("")
  const [canManageNews, setCanManageNews] = useState(false)
  const { keycloak, initialized } = useKeycloak()


  useEffect(() => {
    if (initialized) {
      keycloak.loadUserInfo()
        .then(userInfo => {
          setCanManageNews(keycloak.authenticated && userInfo.groups.some(item => item === '/admin'))
        })
        .catch(err => {
          console.error(err);
        })
    }
  })


  return (
    <Card {...other}>
      <CardHeader
        title={
          <>
            <Grid container justifyContent="space-between">
              <Grid item >
                {title}
              </Grid>
              {canManageNews ?
                <Grid item >
                  <NewsFormDialog onCreate={onCreate}/>
                </Grid>
                : <></>}
            </Grid>
          </>
        }
        subheader={subheader}>


      </CardHeader>

      <Scrollbar>
        <Stack spacing={3} sx={{ p: 3, pr: 0 }}>
          {list.map((news) => (
            <NewsItem key={news.id} news={news} />
          ))}
        </Stack>
      </Scrollbar>

      <Divider />

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
      </Stack>
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

function NewsItem({ news }) {
  const { image, title, description, postedAt } = news;

  return (
    <Stack direction="row" alignItems="center" spacing={2}>

      {image ?
        <Box component="img" alt={title} src={`data:image/jpeg;base64,${image}`} sx={{ width: 48, height: 48, borderRadius: 1.5, flexShrink: 0 }} />
        :
        <Box component="img" alt={title} src={'/static/icons/no-image.png'} sx={{ width: 48, height: 48, borderRadius: 1.5, flexShrink: 0 }} />
      }

      <Box sx={{ minWidth: 240, flexGrow: 1 }}>
        <Link color="inherit" variant="subtitle2" underline="hover" noWrap>
          {title}
        </Link>

        <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
          {description}
        </Typography>
      </Box>

      <Typography variant="caption" sx={{ pr: 3, flexShrink: 0, color: 'text.secondary' }}>
        {fToNow(postedAt)}
      </Typography>
    </Stack>
  );
}
