'use client'

import dynamic from 'next/dynamic';
import styles from "./page.module.scss"

const ShaderPlane = dynamic(() => import('./_components/r3f-shader'), { ssr: false });

const Home = () => {
  return (
    <main className={`${styles.main}`}>
      {/* <AnimatedImage /> */}
      <ShaderPlane />
    </main>
  );
};

export default Home;