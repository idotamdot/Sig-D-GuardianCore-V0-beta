// App.tsx
import { GuardianProvider, useGuardian } from "@sigilographics/guardian";


function KarmaWidget() {
const { id, memory, audit } = useGuardian();
// read a remembered preference
React.useEffect(() => {
(async () => {
const theme = await memory.get("ui", "theme");
await audit.emit({ actor: "user", action: "read-theme", result: "success", details: { theme } });
})();
}, [memory, audit]);
return <div>Guardian: {id.displayName} {id.sigil}</div>;
}


export default function App() {
return (
<GuardianProvider>
<KarmaWidget />
</GuardianProvider>
);
}