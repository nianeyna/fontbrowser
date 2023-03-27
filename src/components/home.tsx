import Families from "./families";
import { AllFeatures } from "./features";
import SampleOptions from "./sampleoptions";
import SearchOptions from "./searchoptions";

export default function Home() {
  return (
    <>
      <div className="border rounded p-2 mb-3">
        <SearchOptions />
        <SampleOptions />
        <AllFeatures />
      </div>
      <Families />
    </>
  );
}
