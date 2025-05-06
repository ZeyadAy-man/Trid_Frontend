import styles from "./Home.module.css";
import Nav from "../Nav/Nav";
import List from "../ShopList/ShopList";
import Slider from "../Slider/Slider";

export default function Home() {
  return (
    <div className={styles.homeContainer}>
      <Nav />
      <List />
      <Slider
        images={[
          "./slider1.jpg",
          "./slider2.jpg",
          "./slider3.jpg",
          "./slider4.jpg",
        ]}
      />
    </div>
  );
}
