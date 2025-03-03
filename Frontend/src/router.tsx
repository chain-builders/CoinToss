import { createBrowserRouter, createRoutesFromElements,Route } from "react-router-dom";
import HeroPage from "./page/HeroPage";
import Root from "./Root";
import MinorityGame from "./page/Pools";
import PlayGame from "./page/Play";

const router=createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<Root/>}>
            <Route index element={<HeroPage/>}/>
             <Route path="explore" element={<MinorityGame/>}/>
             <Route path="playgame" element={<PlayGame/>}/>
        </Route>
    )
)


export default router