import { HashRouter as Router, useRoutes } from "react-router-dom";

import Layout from "./Layout";
import Home from "./views/home";

import Detail from "./views/detail";

const GetRoutes = () => {
  const routes = useRoutes([
    {
      path: "/",
      element: <Layout></Layout>,
      children: [
        {
          path: "",
          element: <Home></Home>,
        },

        {
          path: "detail/:id",
          element: <Detail></Detail>,
        },
      ],
    },
  ]);

  return routes;
};

function App() {
  return (
    <Router>
      <GetRoutes />
    </Router>
  );
}

export default App;
