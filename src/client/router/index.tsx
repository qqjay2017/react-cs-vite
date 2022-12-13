
import { BrowserRouter } from "react-router-dom";
import Routes from "./routes";

function Router() {
  const basename = import.meta.env.BASE_URL || "/";
  return (
    <BrowserRouter basename={basename}>
      <Routes />
    </BrowserRouter>
  );
}

export default Router;
