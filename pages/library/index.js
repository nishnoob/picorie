import { useEffect, useState } from "react";
import { isServer } from "../../src/utils";
import Component from "../../src/screens/library";
import { useRouter } from "next/router.js";
import { useUser } from "@auth0/nextjs-auth0";

function LibraryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const { user, isLoading } = useUser();
  
  useEffect(() => {
    if (!isServer()) {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && !user?.email ) {
      router?.push('/');
    }
  }, [isLoading]);

  return loading ? <div /> : <Component userId={router?.query?.slug?.[0]} />;
}

export default LibraryPage