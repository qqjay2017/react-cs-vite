import { Suspense } from "react";
import { useRoutes } from "react-router-dom";
// import Layout from "../layout";

import routes from "~react-pages";
import Layout from "../layout";

let routesFilter = routes.filter((item) => {
  return item && item.path != "/";
});

function Routes() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      {useRoutes([
        {
          path: "/",
          children: routesFilter,
          element: <Layout />,
        },
      ])}
    </Suspense>
  );
}

export default Routes;
