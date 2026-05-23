import { Metadata } from "next";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

type Props = {
  params: Promise<{ nickname: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const nickname = resolvedParams.nickname;

  try {
    // 1. Fetch UID by nickname
    const nicknameDoc = await getDoc(doc(db, "nicknames", nickname));
    if (!nicknameDoc.exists()) {
      return {
        title: "Page Not Found",
      };
    }
    
    const uid = nicknameDoc.data().uid;

    // 2. Fetch User Profile by UID
    const userDoc = await getDoc(doc(db, "users", uid));
    if (!userDoc.exists()) {
      return {
        title: "User Not Found",
      };
    }

    const userData = userDoc.data();
    const username = userData.username || nickname;
    const bio = userData.bio || "Gather all your scattered activities into a single, clean page.";

    return {
      title: `${username} (@${nickname})`,
      description: bio,
      openGraph: {
        title: `${username} (@${nickname}) | MyLink`,
        description: bio,
        url: `https://my-link-six-orcin.vercel.app/${nickname}`,
        type: "profile",
      },
      twitter: {
        card: "summary_large_image",
        title: `${username} (@${nickname}) | MyLink`,
        description: bio,
      },
    };
  } catch (error) {
    console.error("Error fetching metadata:", error);
    return {
      title: "MyLink",
    };
  }
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
