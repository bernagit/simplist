'use client';

import { useParams } from "next/navigation";

export default function ListPage() {
  const params = useParams();

  console.log("ListPage params:", params);

  return (
    <div>
      <h1>List Page</h1>
    </div>
  );
}