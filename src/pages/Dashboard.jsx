import { useEffect, useState } from "react";
import { getCheckins } from "../../../normal-react/src/api/checkins";

export default function Dashboard() {
  const [checkins, setCheckins] = useState([]);

  useEffect(() => {
    getCheckins()
      .then((res) => setCheckins(res.checkIns))
      .catch(console.error);
  }, []);

  return (
    <div>
      <h2>My Check-ins</h2>
      {checkins.map((c) => (
        <div key={c._id}>{c.date} — Score: {c.score}</div>
      ))}
    </div>
  );
}
