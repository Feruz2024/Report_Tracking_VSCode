import React from "react";
import { Box, Typography } from "@mui/material";

function StationMuxInfo() {
  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 1200,
        mx: 'auto',
        mt: 3,
        mb: 4,
        p: { xs: 2, sm: 4, md: 6 },
        background: 'rgba(255,255,255,0.92)',
        borderRadius: 6,
        boxShadow: '0 8px 32px 0 rgba(80,80,160,0.08)',
        border: '1.5px solid #e0e7ff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: 600,
        overflowX: 'auto',
      }}
    >
      <Typography
        variant="h5"
        sx={{
          color: '#2a4365',
          fontWeight: 800,
          letterSpacing: 0.5,
          textShadow: '0 2px 8px #fbcfe8',
          fontSize: { xs: 17, sm: 21, md: 23 },
          display: 'block',
          alignItems: 'center',
          mt: 0,
          pl: 0,
          mb: 2
        }}
      >
        Station Mux Information
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, width: '100%', alignItems: 'flex-start', justifyContent: 'center', mt: 2, overflowX: 'auto', pb: 2 }}>
        {/* Example cards, replace with real data as needed */}
        <Box sx={{ background: '#f1f5f9', borderRadius: 2, p: 2.5, boxShadow: '0 2px 8px #e2e8f0', mb: 1, width: 260, minWidth: 160, maxWidth: 260, flex: '0 0 auto' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#22577a', mb: 1, fontSize: 15 }}>Abay TV</Typography>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li><Typography variant="body2" sx={{ color: '#555', fontSize: 11 }}>Video - Abay TV - Amh</Typography></li>
            <li><Typography variant="body2" sx={{ color: '#555', fontSize: 11 }}>Audio 1 - FM 96.3 - Finish</Typography></li>
            <li><Typography variant="body2" sx={{ color: '#555', fontSize: 11 }}>Audio 2 - Dire TV - Dzongkha</Typography></li>
          </ul>
        </Box>
        <Box sx={{ background: '#f1f5f9', borderRadius: 2, p: 2.5, boxShadow: '0 2px 8px #e2e8f0', mb: 1, width: 260, minWidth: 160, maxWidth: 280, flex: '0 0 auto' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#22577a', mb: 1, fontSize: 15 }}>ARTs TV</Typography>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li><Typography variant="body2" sx={{ color: '#555', fontSize: 11 }}>Video - ARTs TV - Amh</Typography></li>
            <li><Typography variant="body2" sx={{ color: '#555', fontSize: 11 }}>Audio 1 – Minber TV - Arabic</Typography></li>
            <li><Typography variant="body2" sx={{ color: '#555', fontSize: 11 }}>Audio 2 - Africa TV – Arabic (2)</Typography></li>
          </ul>
        </Box>
        <Box sx={{ background: '#f1f5f9', borderRadius: 2, p: 2.5, boxShadow: '0 2px 8px #e2e8f0', mb: 1, width: 260, minWidth: 160, maxWidth: 280 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#22577a', mb: 1, fontSize: 15 }}>EBC News</Typography>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li><Typography variant="body2" sx={{ color: '#555', fontSize: 11 }}>Video - EBC News - Amh</Typography></li>
            <li><Typography variant="body2" sx={{ color: '#555', fontSize: 11 }}>Audio 1 – EBC Lang - Ewe</Typography></li>
            <li><Typography variant="body2" sx={{ color: '#555', fontSize: 11 }}>Audio 2 – EBC Oromo – Oro</Typography></li>
          </ul>
        </Box>
          <Box sx={{ background: '#f1f5f9', borderRadius: 2, p: 2.5, boxShadow: '0 2px 8px #e2e8f0', mb: 1, width: 260, minWidth: 160, maxWidth: 280 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#22577a', mb: 1, fontSize: 15 }}>EBS TV</Typography>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li><Typography variant="body2" sx={{ color: '#555', fontSize: 11 }}>Video - EBS TV - Amh</Typography></li>
              <li><Typography variant="body2" sx={{ color: '#555', fontSize: 11 }}>Audio 1 – Asham TV – Amh (2)</Typography></li>
              <li><Typography variant="body2" sx={{ color: '#555', fontSize: 11 }}>Audio 2 – Nejashi TV – Arabic</Typography></li>
            </ul>
          </Box>
          <Box sx={{ background: '#f1f5f9', borderRadius: 2, p: 2.5, boxShadow: '0 2px 8px #e2e8f0', mb: 1, width: 260, minWidth: 160, maxWidth: 280 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#22577a', mb: 1, fontSize: 15 }}>Kana TV</Typography>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li><Typography variant="body2" sx={{ color: '#555', fontSize: 11 }}>Video – Kana TV - Amh</Typography></li>
              <li><Typography variant="body2" sx={{ color: '#555', fontSize: 11 }}>Audio 1 – Addis TV - Ava</Typography></li>
              <li><Typography variant="body2" sx={{ color: '#555', fontSize: 11 }}>Audio 2 – SRTV – Som</Typography></li>
            </ul>
          </Box>
          <Box sx={{ background: '#f1f5f9', borderRadius: 2, p: 2.5, boxShadow: '0 2px 8px #e2e8f0', mb: 1, width: 260, minWidth: 160, maxWidth: 280 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#22577a', mb: 1, fontSize: 15 }}>Fana TV</Typography>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li><Typography variant="body2" sx={{ color: '#555', fontSize: 11 }}>Video - Fana TV - Amh</Typography></li>
              <li><Typography variant="body2" sx={{ color: '#555', fontSize: 11 }}>Audio 1 – Fana FM – Eng</Typography></li>
              <li><Typography variant="body2" sx={{ color: '#555', fontSize: 11 }}>Audio 2 – Nejashi TV – Eng (2)</Typography></li>
              <li><Typography variant="body2" sx={{ color: '#555', fontSize: 11 }}>Audio 2 – Addis Walta – Walloon</Typography></li>
            </ul>
          </Box>
          <Box sx={{ background: '#f1f5f9', borderRadius: 2, p: 2.5, boxShadow: '0 2px 8px #e2e8f0', mb: 1, width: 260, minWidth: 160, maxWidth: 280 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#22577a', mb: 1, fontSize: 15 }}>OBN</Typography>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li><Typography variant="body2" sx={{ color: '#555', fontSize: 11 }}>Video – OBN - Oro</Typography></li>
              <li><Typography variant="body2" sx={{ color: '#555', fontSize: 11 }}>Audio 1 – OBN Radio – Oro (2)</Typography></li>
              <li><Typography variant="body2" sx={{ color: '#555', fontSize: 11 }}>Audio 2 – NBC – Amh</Typography></li>
            </ul>
        </Box>
      </Box>
    </Box>
  );
}

export default StationMuxInfo;
