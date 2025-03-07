import Header from "./components/Header"
import { Outlet } from "react-router-dom"

const Root = () => {
  return (
    <div className="relative">
      <Header/>
     <div className="pt-20">
     <Outlet/>
     </div>
    </div>
  )
}

export default Root
