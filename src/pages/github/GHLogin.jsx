import { useEffect, useState } from "react";

export const GHLogin = () => {
  const [data, setData] = useState({ errorMessage: "", isLoading: false });

  // PROD
  let client_id = "6c3a489177c7833cc639";
  let redirect_uri = "https://cloud.cbh.kth.se/ghlogin";

  if (window.location.href.includes("localhost")) {
    // DEV
    client_id = "12ec7f8b9a291a4817c6";
    redirect_uri = "http://localhost:3000/ghlogin";
  }

  useEffect(() => {
    // After requesting Github access, Github redirects back to your app with a code parameter
    const url = window.location.href;
    const hasCode = url.includes("?code=");

    // If Github API returns the code parameter
    if (hasCode) {
      const newUrl = url.split("?code=");
      window.history.pushState({}, null, newUrl[0]);
      setData({ ...data, isLoading: true });

      console.log(newUrl[1]);
    }
  }, [data]);

  console.log(data);

  return (
    <div>
      <h1>Welcome</h1>
      <span>Super amazing app</span>
      <span>{data.errorMessage}</span>
      <div className="login-container">
        {data.isLoading ? (
          <div className="loader-container">
            <div className="loader"></div>
          </div>
        ) : (
          <>
            {
              // Link to request GitHub access
            }
            <a
              className="login-link"
              href={`https://github.com/login/oauth/authorize?scope=user&client_id=${client_id}&redirect_uri=${redirect_uri}`}
              onClick={() => {
                setData({ ...data, errorMessage: "" });
              }}
            >
              <span>Login with GitHub</span>
            </a>
          </>
        )}
      </div>
    </div>
  );
};
