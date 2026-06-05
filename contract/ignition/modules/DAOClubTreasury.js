module.exports = buildModule("DAOClubGovernorModule", (m) => {
  const token = "0x275fcE2aAC17Ce0F8FDe3855137a6EFAFAE8114F"; // Replace with actual address
  const timelock = "0x9F44484c93334cbc2CeADE093be6A67926374Ca7"; // Replace with actual address
  const governor = m.contract("DAOClubGovernor", [token, timelock]);
  return { governor };
});
