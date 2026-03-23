import { Loader, Scroll, ScrollControls, Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { Experience } from "./components/Experience";
import { UI } from "./components/UI";

function App() {
  return (
    <>
      <Leva collapsed={true} hidden />
      <Loader />
      <Stats/>
      <Canvas shadows camera={{ position: [0, 3, 20], fov: 50 }}>
        <color attach="background" args={["#131017"]} />
        <ScrollControls pages={4} damping={0.2}>
          <Experience />
          <Scroll html>
            <UI />
          </Scroll>
        </ScrollControls>
      </Canvas>
    </>
  );
}

export default App;
