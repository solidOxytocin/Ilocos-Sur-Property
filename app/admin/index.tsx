import { Redirect } from "expo-router";

/** `/admin` has no list UI; send users to the properties admin screen. */
export default function AdminIndex() {
  return <Redirect href="/admin/properties" />;
}
