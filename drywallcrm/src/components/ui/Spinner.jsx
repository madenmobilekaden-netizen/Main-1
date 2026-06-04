export default function Spinner({ size = 32 }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-full border-[3px] border-border border-t-yellow animate-spin"
      style={{ width: size, height: size, borderWidth: 3, borderColor: "#1e2a40", borderTopColor: "#3d6fab", borderRadius: "50%", animation: "spin .7s linear infinite" }}
    />
  );
}
