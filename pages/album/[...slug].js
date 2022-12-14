import { useEffect, useState } from "react";
import { isServer } from "../../src/utils";
import Component from "../../src/screens/album";
import { useRouter } from "next/router.js";

function AlbumPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!isServer()) {
      setLoading(false);
    }
  }, []);

  return loading ? <div /> : <Component albumId={router?.query?.slug?.[0]} />;
}

export default AlbumPage