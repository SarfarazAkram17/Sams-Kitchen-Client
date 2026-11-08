import Navbar from "../Components/Shared/Navbar";
import Footer from "../Components/Shared/Footer";
import Header from "../Components/Shared/Header";
import { ShellContext } from "./ShellContext";

// Header, navbar and footer around a public page. The real pages and their
// loading skeletons both render through this, so nothing moves when data arrives.
const PublicFrame = ({ children }) => (
  <ShellContext value={true}>
    <div className="min-h-screen bg-base-100 text-base-content">
      <div className="sticky z-50 top-0">
        <Header></Header>
        <Navbar></Navbar>
      </div>
      <main className="page-enter mx-auto min-h-[45vh] w-full pt-5 sm:pt-8">
        {children}
      </main>
      <Footer />
    </div>
  </ShellContext>
);

export default PublicFrame;
