import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";

export default function Layout() {
  useEffect(() => {
    // navigate("/paper");
  }, []);

  return (
    <div>
      <Outlet></Outlet>
    </div>
  );
}
