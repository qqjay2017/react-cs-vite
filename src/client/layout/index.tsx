
import {Outlet} from 'react-router-dom';
function Layout() {
  return (
    <div>
      Layout
      <div>
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;
