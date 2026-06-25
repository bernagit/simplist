import Homepage from "@/components/Homepage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Home - Simplist",
    description: "Welcome to the Simplist homepage.",
};

export default function HomePage() {
    return <Homepage />;
}
