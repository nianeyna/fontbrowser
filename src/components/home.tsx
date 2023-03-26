import Families from "./families";
import { AllFeatures } from "./features";
import SampleOptions from "./sampleoptions";
import SearchOptions from "./searchoptions";

export default function Home() {
  return (
    <>
      <SearchOptions />
      <SampleOptions />
      <AllFeatures />
      <Families />
    </>
  );
}
