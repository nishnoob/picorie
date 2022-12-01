import { useEffect, useState } from "react";
import { isServer } from "../../src/components/utils";
import Component from "../../src/components/index.jsx";
import { useRouter } from "next/router.js";

function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isServer()) {
      setLoading(false);
    }
  }, []);

  return loading ? <div /> : <Component albumId={router?.query?.slug?.[0]} />;
}

export default HomePage