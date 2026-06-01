import * as XLSX from "xlsx";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const stocks = [
  // ── LARGE CAP ────────────────────────────────────────────────────────────
  { StockCode:"RELIANCE", CompanyName:"Reliance Industries Ltd", Industry:"Energy", SubIndustry:"Oil & Gas Refining", MarketCapCategory:"LargeCap", Exchange:"NSE", PurchaseDate:"2021-03-15", Quantity:100, AverageBuyPrice:2200, CurrentPrice:2847, EPS:98.5, BookValuePerShare:1218, CurrentPE:28.9, HistoricalAveragePE:22.0, Week52High:3024, Week52Low:2180, Year3High:3024, Year3Low:1830, Year5High:3024, Year5Low:960, AllTimeHigh:3024, ROEPercent:14.2, ROCEPercent:12.8, DebtToEquityRatio:0.42, RevenueGrowthPercent:18.5, EPSGrowthPercent:22.1, DividendReceived:4500, TargetWeightPercent:12, InvestmentThesis:"Diversified conglomerate — Jio and Reliance Retail driving future value. Refining + petrochemicals provide cash flow.", Notes:"Core holding" },
  { StockCode:"TCS", CompanyName:"Tata Consultancy Services Ltd", Industry:"Technology", SubIndustry:"IT Services", MarketCapCategory:"LargeCap", Exchange:"NSE", PurchaseDate:"2019-07-10", Quantity:50, AverageBuyPrice:3100, CurrentPrice:4182, EPS:128.7, BookValuePerShare:485, CurrentPE:32.5, HistoricalAveragePE:28.0, Week52High:4300, Week52Low:3204, Year3High:4300, Year3Low:2820, Year5High:4300, Year5Low:1960, AllTimeHigh:4300, ROEPercent:52.1, ROCEPercent:68.4, DebtToEquityRatio:0.01, RevenueGrowthPercent:14.2, EPSGrowthPercent:16.8, DividendReceived:5200, TargetWeightPercent:10, InvestmentThesis:"Market leader in Indian IT. Consistent dividend payer with strong free cash flow.", Notes:"Long-term compounder" },
  { StockCode:"HDFCBANK", CompanyName:"HDFC Bank Ltd", Industry:"Banking & Finance", SubIndustry:"Private Sector Bank", MarketCapCategory:"LargeCap", Exchange:"NSE", PurchaseDate:"2020-04-20", Quantity:200, AverageBuyPrice:1450, CurrentPrice:1618, EPS:84.2, BookValuePerShare:582, CurrentPE:19.2, HistoricalAveragePE:22.5, Week52High:1757, Week52Low:1363, Year3High:1757, Year3Low:1202, Year5High:1757, Year5Low:872, AllTimeHigh:1757, ROEPercent:16.8, ROCEPercent:18.2, DebtToEquityRatio:8.2, RevenueGrowthPercent:21.3, EPSGrowthPercent:19.7, DividendReceived:7200, TargetWeightPercent:15, InvestmentThesis:"India's best managed private bank. Post-HDFC merger synergies playing out.", Notes:"Overweight position — review" },
  { StockCode:"INFY", CompanyName:"Infosys Ltd", Industry:"Technology", SubIndustry:"IT Services", MarketCapCategory:"LargeCap", Exchange:"NSE", PurchaseDate:"2020-06-05", Quantity:150, AverageBuyPrice:1380, CurrentPrice:1887, EPS:62.4, BookValuePerShare:312, CurrentPE:30.3, HistoricalAveragePE:25.0, Week52High:1975, Week52Low:1354, Year3High:1975, Year3Low:1104, Year5High:1975, Year5Low:585, AllTimeHigh:1975, ROEPercent:32.5, ROCEPercent:42.8, DebtToEquityRatio:0.05, RevenueGrowthPercent:12.1, EPSGrowthPercent:14.3, DividendReceived:6300, TargetWeightPercent:10, InvestmentThesis:"Strong brand, deep client relationships. Narrowing gap with TCS on deal wins.", Notes:"" },
  { StockCode:"BAJFINANCE", CompanyName:"Bajaj Finance Ltd", Industry:"Banking & Finance", SubIndustry:"NBFC", MarketCapCategory:"LargeCap", Exchange:"NSE", PurchaseDate:"2022-01-10", Quantity:30, AverageBuyPrice:5800, CurrentPrice:7248, EPS:298.4, BookValuePerShare:1852, CurrentPE:24.3, HistoricalAveragePE:38.0, Week52High:8192, Week52Low:6204, Year3High:8192, Year3Low:5002, Year5High:8192, Year5Low:2020, AllTimeHigh:8192, ROEPercent:24.8, ROCEPercent:11.2, DebtToEquityRatio:3.8, RevenueGrowthPercent:28.4, EPSGrowthPercent:31.2, DividendReceived:1800, TargetWeightPercent:8, InvestmentThesis:"India's premier consumer lending franchise. PE well below historical average — opportunity.", Notes:"Buy more on dips" },
  { StockCode:"MARUTI", CompanyName:"Maruti Suzuki India Ltd", Industry:"Automobile", SubIndustry:"Passenger Vehicles", MarketCapCategory:"LargeCap", Exchange:"NSE", PurchaseDate:"2021-08-22", Quantity:20, AverageBuyPrice:8200, CurrentPrice:12418, EPS:485.2, BookValuePerShare:3218, CurrentPE:25.6, HistoricalAveragePE:28.0, Week52High:13680, Week52Low:9422, Year3High:13680, Year3Low:6502, Year5High:13680, Year5Low:4020, AllTimeHigh:13680, ROEPercent:18.4, ROCEPercent:22.6, DebtToEquityRatio:0.02, RevenueGrowthPercent:16.8, EPSGrowthPercent:42.1, DividendReceived:2400, TargetWeightPercent:7, InvestmentThesis:"Market leader in Indian PV with 42% market share. New SUV launches driving premiumisation.", Notes:"" },
  { StockCode:"ASIANPAINT", CompanyName:"Asian Paints Ltd", Industry:"Consumer Goods", SubIndustry:"Paints & Coatings", MarketCapCategory:"LargeCap", Exchange:"NSE", PurchaseDate:"2019-11-14", Quantity:60, AverageBuyPrice:2800, CurrentPrice:2948, EPS:52.4, BookValuePerShare:296, CurrentPE:56.3, HistoricalAveragePE:62.0, Week52High:3868, Week52Low:2526, Year3High:3868, Year3Low:2202, Year5High:3868, Year5Low:1402, AllTimeHigh:3868, ROEPercent:28.6, ROCEPercent:36.4, DebtToEquityRatio:0.12, RevenueGrowthPercent:6.2, EPSGrowthPercent:4.8, DividendReceived:1920, TargetWeightPercent:5, InvestmentThesis:"Consistent compounder with pricing power. Near-term headwinds from competition.", Notes:"Hold — watch competition" },
  { StockCode:"SUNPHARMA", CompanyName:"Sun Pharmaceutical Industries", Industry:"Healthcare", SubIndustry:"Pharmaceuticals", MarketCapCategory:"LargeCap", Exchange:"NSE", PurchaseDate:"2022-03-18", Quantity:120, AverageBuyPrice:980, CurrentPrice:1678, EPS:52.1, BookValuePerShare:382, CurrentPE:32.2, HistoricalAveragePE:30.0, Week52High:1960, Week52Low:1152, Year3High:1960, Year3Low:752, Year5High:1960, Year5Low:412, AllTimeHigh:1960, ROEPercent:15.2, ROCEPercent:18.4, DebtToEquityRatio:0.18, RevenueGrowthPercent:14.6, EPSGrowthPercent:28.4, DividendReceived:2400, TargetWeightPercent:6, InvestmentThesis:"Specialty pharma driving margin expansion. US business stabilising.", Notes:"" },
  { StockCode:"TITAN", CompanyName:"Titan Company Ltd", Industry:"Consumer Goods", SubIndustry:"Jewelry & Watches", MarketCapCategory:"LargeCap", Exchange:"NSE", PurchaseDate:"2020-09-01", Quantity:80, AverageBuyPrice:1650, CurrentPrice:3578, EPS:54.2, BookValuePerShare:286, CurrentPE:66.1, HistoricalAveragePE:72.0, Week52High:4008, Week52Low:3058, Year3High:4008, Year3Low:1902, Year5High:4008, Year5Low:902, AllTimeHigh:4008, ROEPercent:29.4, ROCEPercent:35.8, DebtToEquityRatio:0.05, RevenueGrowthPercent:22.4, EPSGrowthPercent:18.6, DividendReceived:1760, TargetWeightPercent:5, InvestmentThesis:"Premium brand portfolio. Gold price tailwind. Caratlane acquisition paying off.", Notes:"Near 52W High — partial book?" },
  { StockCode:"NESTLEIND", CompanyName:"Nestle India Ltd", Industry:"Consumer Goods", SubIndustry:"FMCG - Food", MarketCapCategory:"LargeCap", Exchange:"NSE", PurchaseDate:"2018-06-10", Quantity:10, AverageBuyPrice:10200, CurrentPrice:22804, EPS:328.4, BookValuePerShare:984, CurrentPE:69.4, HistoricalAveragePE:80.0, Week52High:27442, Week52Low:20544, Year3High:27442, Year3Low:16002, Year5High:27442, Year5Low:10020, AllTimeHigh:27442, ROEPercent:110.2, ROCEPercent:98.4, DebtToEquityRatio:0.01, RevenueGrowthPercent:8.6, EPSGrowthPercent:7.8, DividendReceived:3200, TargetWeightPercent:4, InvestmentThesis:"FMCG giant with near-zero debt and exceptional ROCE. Consistent compounder.", Notes:"Multibagger since 2018" },

  // ── MID CAP ──────────────────────────────────────────────────────────────
  { StockCode:"POLYCAB", CompanyName:"Polycab India Ltd", Industry:"Industrials", SubIndustry:"Cables & Wires", MarketCapCategory:"MidCap", Exchange:"NSE", PurchaseDate:"2022-05-12", Quantity:40, AverageBuyPrice:3200, CurrentPrice:6102, EPS:142.8, BookValuePerShare:820, CurrentPE:42.7, HistoricalAveragePE:35.0, Week52High:7204, Week52Low:4102, Year3High:7204, Year3Low:2402, Year5High:7204, Year5Low:1202, AllTimeHigh:7204, ROEPercent:22.4, ROCEPercent:28.6, DebtToEquityRatio:0.08, RevenueGrowthPercent:24.2, EPSGrowthPercent:32.4, DividendReceived:1200, TargetWeightPercent:4, InvestmentThesis:"Infra capex beneficiary. Cable and wire market leader expanding into FMEG.", Notes:"" },
  { StockCode:"DIXON", CompanyName:"Dixon Technologies India Ltd", Industry:"Technology", SubIndustry:"Electronics Manufacturing", MarketCapCategory:"MidCap", Exchange:"NSE", PurchaseDate:"2023-01-15", Quantity:25, AverageBuyPrice:9800, CurrentPrice:15802, EPS:232.1, BookValuePerShare:1204, CurrentPE:68.1, HistoricalAveragePE:58.0, Week52High:19204, Week52Low:9602, Year3High:19204, Year3Low:5802, Year5High:19204, Year5Low:3802, AllTimeHigh:19204, ROEPercent:32.8, ROCEPercent:38.2, DebtToEquityRatio:0.22, RevenueGrowthPercent:42.4, EPSGrowthPercent:48.6, DividendReceived:400, TargetWeightPercent:3, InvestmentThesis:"PLI scheme beneficiary. Electronics manufacturing hub. Samsung, Motorola contracts.", Notes:"High growth, high PE — size appropriately" },
  { StockCode:"IRCTC", CompanyName:"Indian Railway Catering & Tourism", Industry:"Consumer Services", SubIndustry:"Travel & Tourism", MarketCapCategory:"MidCap", Exchange:"NSE", PurchaseDate:"2022-09-10", Quantity:100, AverageBuyPrice:680, CurrentPrice:820, EPS:12.2, BookValuePerShare:52, CurrentPE:67.2, HistoricalAveragePE:85.0, Week52High:1002, Week52Low:684, Year3High:1002, Year3Low:482, Year5High:1002, Year5Low:152, AllTimeHigh:1002, ROEPercent:38.4, ROCEPercent:42.8, DebtToEquityRatio:0.0, RevenueGrowthPercent:18.4, EPSGrowthPercent:22.6, DividendReceived:600, TargetWeightPercent:2, InvestmentThesis:"Government-backed monopoly in rail ticketing, catering, and tourism. Asset-light model.", Notes:"PE below historical avg — add" },
  { StockCode:"PERSISTENT", CompanyName:"Persistent Systems Ltd", Industry:"Technology", SubIndustry:"IT Services", MarketCapCategory:"MidCap", Exchange:"NSE", PurchaseDate:"2022-02-14", Quantity:35, AverageBuyPrice:3800, CurrentPrice:6204, EPS:184.2, BookValuePerShare:842, CurrentPE:33.7, HistoricalAveragePE:30.0, Week52High:7204, Week52Low:4104, Year3High:7204, Year3Low:2402, Year5High:7204, Year5Low:982, AllTimeHigh:7204, ROEPercent:28.4, ROCEPercent:34.6, DebtToEquityRatio:0.04, RevenueGrowthPercent:34.2, EPSGrowthPercent:38.8, DividendReceived:840, TargetWeightPercent:3, InvestmentThesis:"Mid-tier IT with outsized growth. AI/GenAI capabilities driving deal wins.", Notes:"" },
  { StockCode:"GODREJCP", CompanyName:"Godrej Consumer Products Ltd", Industry:"Consumer Goods", SubIndustry:"FMCG - Personal Care", MarketCapCategory:"MidCap", Exchange:"NSE", PurchaseDate:"2021-11-20", Quantity:80, AverageBuyPrice:980, CurrentPrice:1248, EPS:38.4, BookValuePerShare:282, CurrentPE:32.5, HistoricalAveragePE:42.0, Week52High:1604, Week52Low:1004, Year3High:1604, Year3Low:804, Year5High:1604, Year5Low:604, AllTimeHigh:1604, ROEPercent:22.4, ROCEPercent:28.2, DebtToEquityRatio:0.28, RevenueGrowthPercent:12.4, EPSGrowthPercent:14.8, DividendReceived:1200, TargetWeightPercent:3, InvestmentThesis:"Africa expansion driving growth. Strong in home insecticides and hair care.", Notes:"PE below historical — accumulate" },
  { StockCode:"MPHASIS", CompanyName:"Mphasis Ltd", Industry:"Technology", SubIndustry:"IT Services", MarketCapCategory:"MidCap", Exchange:"NSE", PurchaseDate:"2022-04-08", Quantity:45, AverageBuyPrice:2800, CurrentPrice:2604, EPS:98.4, BookValuePerShare:522, CurrentPE:26.5, HistoricalAveragePE:35.0, Week52High:3004, Week52Low:2204, Year3High:4204, Year3Low:2004, Year5High:4204, Year5Low:702, AllTimeHigh:4204, ROEPercent:24.2, ROCEPercent:30.4, DebtToEquityRatio:0.06, RevenueGrowthPercent:8.4, EPSGrowthPercent:6.2, DividendReceived:1080, TargetWeightPercent:2, InvestmentThesis:"DXC parent driving deal pipeline. BFSI focus strong for fintech transformation mandates.", Notes:"Under pressure — monitor" },
  { StockCode:"AAVAS", CompanyName:"Aavas Financiers Ltd", Industry:"Banking & Finance", SubIndustry:"Housing Finance", MarketCapCategory:"MidCap", Exchange:"NSE", PurchaseDate:"2023-03-14", Quantity:50, AverageBuyPrice:1780, CurrentPrice:2004, EPS:82.4, BookValuePerShare:704, CurrentPE:24.3, HistoricalAveragePE:32.0, Week52High:2404, Week52Low:1604, Year3High:2804, Year3Low:1404, Year5High:2804, Year5Low:902, AllTimeHigh:2804, ROEPercent:14.2, ROCEPercent:10.8, DebtToEquityRatio:4.2, RevenueGrowthPercent:22.4, EPSGrowthPercent:18.6, DividendReceived:0, TargetWeightPercent:2, InvestmentThesis:"Affordable housing lender in tier 2-4 markets. Low NPA, strong asset quality.", Notes:"" },
  { StockCode:"ZOMATO", CompanyName:"Zomato Ltd", Industry:"Consumer Services", SubIndustry:"Food Delivery", MarketCapCategory:"MidCap", Exchange:"NSE", PurchaseDate:"2023-06-20", Quantity:500, AverageBuyPrice:72, CurrentPrice:224, EPS:2.1, BookValuePerShare:32, CurrentPE:106.7, HistoricalAveragePE:0, Week52High:304, Week52Low:148, Year3High:304, Year3Low:42, Year5High:304, Year5Low:42, AllTimeHigh:304, ROEPercent:4.2, ROCEPercent:5.8, DebtToEquityRatio:0.12, RevenueGrowthPercent:68.4, EPSGrowthPercent:0, DividendReceived:0, TargetWeightPercent:2, InvestmentThesis:"Dominant food delivery + Blinkit quick commerce. Path to profitability achieved.", Notes:"High risk-high reward. Don't average up." },
  { StockCode:"LTIM", CompanyName:"LTIMindtree Ltd", Industry:"Technology", SubIndustry:"IT Services", MarketCapCategory:"LargeCap", Exchange:"NSE", PurchaseDate:"2022-11-15", Quantity:30, AverageBuyPrice:5200, CurrentPrice:6204, EPS:224.4, BookValuePerShare:1042, CurrentPE:27.6, HistoricalAveragePE:30.0, Week52High:7404, Week52Low:5004, Year3High:7404, Year3Low:4404, Year5High:7404, Year5Low:2204, AllTimeHigh:7404, ROEPercent:26.8, ROCEPercent:32.4, DebtToEquityRatio:0.02, RevenueGrowthPercent:18.4, EPSGrowthPercent:14.2, DividendReceived:900, TargetWeightPercent:3, InvestmentThesis:"Merged entity synergies yet to fully play out. Strong engineering services practice.", Notes:"" },
  { StockCode:"SUPREMEIND", CompanyName:"Supreme Industries Ltd", Industry:"Chemicals", SubIndustry:"Plastics & Pipes", MarketCapCategory:"MidCap", Exchange:"NSE", PurchaseDate:"2021-07-08", Quantity:40, AverageBuyPrice:1980, CurrentPrice:4704, EPS:144.8, BookValuePerShare:724, CurrentPE:32.5, HistoricalAveragePE:28.0, Week52High:5604, Week52Low:4004, Year3High:5604, Year3Low:2204, Year5High:5604, Year5Low:1204, AllTimeHigh:5604, ROEPercent:32.4, ROCEPercent:40.2, DebtToEquityRatio:0.06, RevenueGrowthPercent:14.8, EPSGrowthPercent:18.4, DividendReceived:960, TargetWeightPercent:2, InvestmentThesis:"Plastic pipes and fittings leader. Agri and plumbing segments driving volumes.", Notes:"" },

  // ── SMALL / MID CAP ──────────────────────────────────────────────────────
  { StockCode:"KFINTECH", CompanyName:"KFin Technologies Ltd", Industry:"Banking & Finance", SubIndustry:"Capital Markets", MarketCapCategory:"SmallCap", Exchange:"NSE", PurchaseDate:"2023-02-10", Quantity:150, AverageBuyPrice:380, CurrentPrice:802, EPS:20.4, BookValuePerShare:104, CurrentPE:39.3, HistoricalAveragePE:35.0, Week52High:1004, Week52Low:582, Year3High:1004, Year3Low:340, Year5High:1004, Year5Low:272, AllTimeHigh:1004, ROEPercent:28.4, ROCEPercent:32.8, DebtToEquityRatio:0.08, RevenueGrowthPercent:24.8, EPSGrowthPercent:28.4, DividendReceived:600, TargetWeightPercent:2, InvestmentThesis:"Registrar & Transfer Agent monopoly. Wealth management and AMC registry boom.", Notes:"" },
  { StockCode:"APLAPOLLO", CompanyName:"APL Apollo Tubes Ltd", Industry:"Industrials", SubIndustry:"Steel Tubes", MarketCapCategory:"MidCap", Exchange:"NSE", PurchaseDate:"2022-08-15", Quantity:60, AverageBuyPrice:1080, CurrentPrice:1604, EPS:48.2, BookValuePerShare:282, CurrentPE:33.3, HistoricalAveragePE:30.0, Week52High:1904, Week52Low:1302, Year3High:1904, Year3Low:902, Year5High:1904, Year5Low:402, AllTimeHigh:1904, ROEPercent:22.4, ROCEPercent:28.6, DebtToEquityRatio:0.38, RevenueGrowthPercent:18.4, EPSGrowthPercent:22.8, DividendReceived:720, TargetWeightPercent:2, InvestmentThesis:"Value-added steel tubes. Direct retail strategy compressing channel margins to their advantage.", Notes:"" },
  { StockCode:"TATAELXSI", CompanyName:"Tata Elxsi Ltd", Industry:"Technology", SubIndustry:"Engineering Services", MarketCapCategory:"MidCap", Exchange:"NSE", PurchaseDate:"2021-05-20", Quantity:20, AverageBuyPrice:4200, CurrentPrice:7204, EPS:224.8, BookValuePerShare:842, CurrentPE:32.1, HistoricalAveragePE:40.0, Week52High:9204, Week52Low:6004, Year3High:9204, Year3Low:4204, Year5High:9204, Year5Low:1604, AllTimeHigh:9204, ROEPercent:36.8, ROCEPercent:44.2, DebtToEquityRatio:0.0, RevenueGrowthPercent:22.4, EPSGrowthPercent:24.8, DividendReceived:600, TargetWeightPercent:2, InvestmentThesis:"Automotive design engineering for EVs. OTT/media platform for Broadcasters. High margin.", Notes:"PE below historical — add" },
  { StockCode:"BRIGADE", CompanyName:"Brigade Enterprises Ltd", Industry:"Real Estate", SubIndustry:"Residential Real Estate", MarketCapCategory:"SmallCap", Exchange:"NSE", PurchaseDate:"2023-04-12", Quantity:100, AverageBuyPrice:480, CurrentPrice:1102, EPS:28.4, BookValuePerShare:248, CurrentPE:38.8, HistoricalAveragePE:28.0, Week52High:1404, Week52Low:858, Year3High:1404, Year3Low:382, Year5High:1404, Year5Low:168, AllTimeHigh:1404, ROEPercent:18.4, ROCEPercent:14.2, DebtToEquityRatio:0.82, RevenueGrowthPercent:38.4, EPSGrowthPercent:42.8, DividendReceived:400, TargetWeightPercent:1, InvestmentThesis:"Bangalore real estate rally. Offices + Hospitality + Residential mix.", Notes:"" },
  { StockCode:"CAMS", CompanyName:"Computer Age Management Services", Industry:"Banking & Finance", SubIndustry:"Capital Markets", MarketCapCategory:"SmallCap", Exchange:"NSE", PurchaseDate:"2022-12-08", Quantity:60, AverageBuyPrice:2400, CurrentPrice:4204, EPS:128.4, BookValuePerShare:524, CurrentPE:32.7, HistoricalAveragePE:38.0, Week52High:5204, Week52Low:3604, Year3High:5204, Year3Low:2104, Year5High:5204, Year5Low:1804, AllTimeHigh:5204, ROEPercent:42.8, ROCEPercent:52.4, DebtToEquityRatio:0.02, RevenueGrowthPercent:22.4, EPSGrowthPercent:24.8, DividendReceived:1440, TargetWeightPercent:2, InvestmentThesis:"MF registrar duopoly. AUM-linked revenue grows with SIP inflows. Recurring cash flows.", Notes:"PE below hist avg — good entry" },
  { StockCode:"MARICO", CompanyName:"Marico Ltd", Industry:"Consumer Goods", SubIndustry:"FMCG - Personal Care", MarketCapCategory:"LargeCap", Exchange:"NSE", PurchaseDate:"2020-10-14", Quantity:200, AverageBuyPrice:380, CurrentPrice:648, EPS:16.4, BookValuePerShare:82, CurrentPE:39.5, HistoricalAveragePE:42.0, Week52High:748, Week52Low:524, Year3High:748, Year3Low:480, Year5High:748, Year5Low:302, AllTimeHigh:748, ROEPercent:38.4, ROCEPercent:48.2, DebtToEquityRatio:0.04, RevenueGrowthPercent:8.4, EPSGrowthPercent:12.8, DividendReceived:3200, TargetWeightPercent:3, InvestmentThesis:"Parachute and Saffola dominant brands. Bangladesh recovery a key re-rating catalyst.", Notes:"" },
  { StockCode:"COFORGE", CompanyName:"Coforge Ltd", Industry:"Technology", SubIndustry:"IT Services", MarketCapCategory:"MidCap", Exchange:"NSE", PurchaseDate:"2022-07-18", Quantity:30, AverageBuyPrice:3600, CurrentPrice:8204, EPS:282.4, BookValuePerShare:1204, CurrentPE:29.1, HistoricalAveragePE:30.0, Week52High:10204, Week52Low:6004, Year3High:10204, Year3Low:3404, Year5High:10204, Year5Low:1204, AllTimeHigh:10204, ROEPercent:28.4, ROCEPercent:34.8, DebtToEquityRatio:0.18, RevenueGrowthPercent:28.4, EPSGrowthPercent:32.8, DividendReceived:720, TargetWeightPercent:2, InvestmentThesis:"BFS and Insurance verticals strong. Cigniti acquisition adds testing capabilities.", Notes:"Strong performer — hold" },
  { StockCode:"BLUEDART", CompanyName:"Blue Dart Express Ltd", Industry:"Industrials", SubIndustry:"Logistics & Courier", MarketCapCategory:"SmallCap", Exchange:"NSE", PurchaseDate:"2023-05-22", Quantity:15, AverageBuyPrice:7200, CurrentPrice:7804, EPS:282.4, BookValuePerShare:1024, CurrentPE:27.6, HistoricalAveragePE:32.0, Week52High:9204, Week52Low:6404, Year3High:9204, Year3Low:5804, Year5High:9204, Year5Low:3804, AllTimeHigh:9204, ROEPercent:28.4, ROCEPercent:34.2, DebtToEquityRatio:0.48, RevenueGrowthPercent:12.4, EPSGrowthPercent:14.8, DividendReceived:375, TargetWeightPercent:1, InvestmentThesis:"DHL-backed express courier. E-commerce volume tailwind. Premium logistics pricing power.", Notes:"" },
  { StockCode:"NAUKRI", CompanyName:"Info Edge (India) Ltd", Industry:"Technology", SubIndustry:"Online Classifieds", MarketCapCategory:"MidCap", Exchange:"NSE", PurchaseDate:"2021-09-10", Quantity:25, AverageBuyPrice:5200, CurrentPrice:8204, EPS:128.4, BookValuePerShare:1604, CurrentPE:63.9, HistoricalAveragePE:72.0, Week52High:9604, Week52Low:5404, Year3High:9604, Year3Low:3804, Year5High:9604, Year5Low:2004, AllTimeHigh:9604, ROEPercent:12.4, ROCEPercent:14.8, DebtToEquityRatio:0.0, RevenueGrowthPercent:18.4, EPSGrowthPercent:14.8, DividendReceived:375, TargetWeightPercent:2, InvestmentThesis:"Naukri.com monopoly in jobs. Zomato + PolicyBazaar holdings provide portfolio optionality.", Notes:"" },
  { StockCode:"ASTRAL", CompanyName:"Astral Ltd", Industry:"Industrials", SubIndustry:"Pipes & Adhesives", MarketCapCategory:"MidCap", Exchange:"NSE", PurchaseDate:"2022-06-08", Quantity:35, AverageBuyPrice:1680, CurrentPrice:2204, EPS:44.2, BookValuePerShare:282, CurrentPE:49.9, HistoricalAveragePE:55.0, Week52High:2704, Week52Low:1804, Year3High:2704, Year3Low:1404, Year5High:2704, Year5Low:804, AllTimeHigh:2704, ROEPercent:24.8, ROCEPercent:30.4, DebtToEquityRatio:0.14, RevenueGrowthPercent:14.8, EPSGrowthPercent:12.4, DividendReceived:315, TargetWeightPercent:2, InvestmentThesis:"Pipes + adhesives dual revenue. Housing construction cycle beneficiary.", Notes:"" },
  { StockCode:"CROMPTON", CompanyName:"Crompton Greaves Consumer Electricals", Industry:"Consumer Goods", SubIndustry:"Consumer Electricals", MarketCapCategory:"MidCap", Exchange:"NSE", PurchaseDate:"2022-10-15", Quantity:200, AverageBuyPrice:320, CurrentPrice:402, EPS:10.4, BookValuePerShare:82, CurrentPE:38.7, HistoricalAveragePE:42.0, Week52High:504, Week52Low:304, Year3High:504, Year3Low:242, Year5High:504, Year5Low:202, AllTimeHigh:504, ROEPercent:18.4, ROCEPercent:22.8, DebtToEquityRatio:0.42, RevenueGrowthPercent:12.4, EPSGrowthPercent:8.4, DividendReceived:800, TargetWeightPercent:2, InvestmentThesis:"Fans and pumps market share gains. Butterfly Gandhimati acquisition for kitchen appliances.", Notes:"Butterfly integration risk — watch" },
  { StockCode:"KALYANKJIL", CompanyName:"Kalyan Jewellers India Ltd", Industry:"Consumer Goods", SubIndustry:"Jewelry & Watches", MarketCapCategory:"MidCap", Exchange:"NSE", PurchaseDate:"2023-07-14", Quantity:300, AverageBuyPrice:280, CurrentPrice:682, EPS:14.8, BookValuePerShare:82, CurrentPE:46.1, HistoricalAveragePE:38.0, Week52High:804, Week52Low:454, Year3High:804, Year3Low:168, Year5High:804, Year5Low:68, AllTimeHigh:804, ROEPercent:16.4, ROCEPercent:14.2, DebtToEquityRatio:0.82, RevenueGrowthPercent:32.4, EPSGrowthPercent:38.8, DividendReceived:600, TargetWeightPercent:2, InvestmentThesis:"Pan-India jewellery expansion. Candere online platform growing. Gold demand secular.", Notes:"" },
];

// Compute derived fields
const rows = stocks.map((s) => {
  const totalCost = s.Quantity * s.AverageBuyPrice;
  const currentValue = s.Quantity * s.CurrentPrice;
  const gainLoss = currentValue - totalCost;
  const gainLossPct = (gainLoss / totalCost) * 100;
  const grahamNumber = s.EPS > 0 && s.BookValuePerShare > 0
    ? Math.sqrt(22.5 * s.EPS * s.BookValuePerShare) : 0;
  const mos = grahamNumber > 0
    ? ((grahamNumber - s.CurrentPrice) / grahamNumber) * 100 : 0;
  const peStatus = s.HistoricalAveragePE > 0
    ? s.CurrentPE < s.HistoricalAveragePE * 0.9 ? "Cheap"
    : s.CurrentPE > s.HistoricalAveragePE * 1.1 ? "Expensive" : "Fair"
    : "N/A";
  const distFrom52WH = ((s.CurrentPrice - s.Week52High) / s.Week52High) * 100;
  const distFrom52WL = ((s.CurrentPrice - s.Week52Low) / s.Week52Low) * 100;
  const distFromATH = ((s.CurrentPrice - s.AllTimeHigh) / s.AllTimeHigh) * 100;

  let buyScore = 0;
  if (s.HistoricalAveragePE > 0 && s.CurrentPE < s.HistoricalAveragePE) buyScore += 20;
  if (mos > 20) buyScore += 20;
  if (s.ROEPercent > 15) buyScore += 15;
  if (s.ROCEPercent > 15) buyScore += 15;
  if (s.RevenueGrowthPercent > 10) buyScore += 10;
  if (s.EPSGrowthPercent > 10) buyScore += 10;
  if (s.DebtToEquityRatio < 0.5) buyScore += 10;

  let sellScore = 0;
  if (gainLossPct > 100) sellScore += 30;
  if (s.HistoricalAveragePE > 0 && s.CurrentPE > s.HistoricalAveragePE * 1.3) sellScore += 25;
  if (Math.abs(distFrom52WH) < 5) sellScore += 15;

  const rec = buyScore >= 60 ? "Strong Buy" : buyScore >= 40 ? "Buy"
    : sellScore >= 60 ? "Strong Sell" : sellScore >= 40 ? "Sell" : "Hold";

  let qualityScore = 0;
  qualityScore += Math.min(s.ROEPercent / 50 * 25, 25);
  qualityScore += Math.min(s.ROCEPercent / 70 * 25, 25);
  qualityScore += Math.max(0, 25 - s.DebtToEquityRatio * 5);
  qualityScore += Math.min(s.EPSGrowthPercent / 40 * 25, 25);

  return {
    StockCode: s.StockCode,
    CompanyName: s.CompanyName,
    Industry: s.Industry,
    SubIndustry: s.SubIndustry,
    MarketCapCategory: s.MarketCapCategory,
    Exchange: s.Exchange,
    PurchaseDate: s.PurchaseDate,
    Quantity: s.Quantity,
    AverageBuyPrice: s.AverageBuyPrice,
    TotalCost: Math.round(totalCost),
    CurrentPrice: s.CurrentPrice,
    CurrentValue: Math.round(currentValue),
    AbsoluteGainLoss: Math.round(gainLoss),
    GainLossPercent: +gainLossPct.toFixed(2),
    DividendReceived: s.DividendReceived,
    CurrentPE: s.CurrentPE,
    HistoricalAveragePE: s.HistoricalAveragePE,
    PEStatus: peStatus,
    EPS: s.EPS,
    BookValuePerShare: s.BookValuePerShare,
    GrahamNumber: grahamNumber > 0 ? +grahamNumber.toFixed(2) : "N/A",
    MarginOfSafetyPercent: +mos.toFixed(2),
    ROEPercent: s.ROEPercent,
    ROCEPercent: s.ROCEPercent,
    DebtToEquityRatio: s.DebtToEquityRatio,
    RevenueGrowthPercent: s.RevenueGrowthPercent,
    EPSGrowthPercent: s.EPSGrowthPercent,
    QualityScore: +qualityScore.toFixed(1),
    Week52High: s.Week52High,
    Week52Low: s.Week52Low,
    DistanceFrom52WHighPercent: +distFrom52WH.toFixed(2),
    DistanceFrom52WLowPercent: +distFrom52WL.toFixed(2),
    AllTimeHigh: s.AllTimeHigh,
    DistanceFromATHPercent: +distFromATH.toFixed(2),
    TargetWeightPercent: s.TargetWeightPercent,
    BuyScore: buyScore,
    SellScore: sellScore,
    Recommendation: rec,
    InvestmentThesis: s.InvestmentThesis,
    Notes: s.Notes,
  };
});

// Build workbook with two sheets
const wb = XLSX.utils.book_new();

// Sheet 1: Full portfolio data
const ws1 = XLSX.utils.json_to_sheet(rows);
// Column widths
ws1["!cols"] = [
  { wch: 12 }, { wch: 36 }, { wch: 20 }, { wch: 24 }, { wch: 12 }, { wch: 6 },
  { wch: 12 }, { wch: 8 }, { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
  { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 10 }, { wch: 16 }, { wch: 10 },
  { wch: 8 }, { wch: 16 }, { wch: 12 }, { wch: 18 }, { wch: 10 }, { wch: 10 },
  { wch: 16 }, { wch: 18 }, { wch: 16 }, { wch: 12 }, { wch: 10 }, { wch: 10 },
  { wch: 20 }, { wch: 20 }, { wch: 10 }, { wch: 18 }, { wch: 10 }, { wch: 10 },
  { wch: 14 }, { wch: 40 }, { wch: 30 },
];
XLSX.utils.book_append_sheet(wb, ws1, "Portfolio Data");

// Sheet 2: Import-ready minimal sheet (for the app import feature)
const importRows = rows.map((r) => ({
  StockCode: r.StockCode,
  CompanyName: r.CompanyName,
  Industry: r.Industry,
  Quantity: r.Quantity,
  AverageBuyPrice: r.AverageBuyPrice,
  CurrentPrice: r.CurrentPrice,
  CurrentPE: r.CurrentPE,
  HistoricalAveragePE: r.HistoricalAveragePE,
  EPS: r.EPS,
  BookValuePerShare: r.BookValuePerShare,
  ROEPercent: r.ROEPercent,
  ROCEPercent: r.ROCEPercent,
  DebtToEquityRatio: r.DebtToEquityRatio,
  RevenueGrowthPercent: r.RevenueGrowthPercent,
  EPSGrowthPercent: r.EPSGrowthPercent,
  Week52High: r.Week52High,
  Week52Low: r.Week52Low,
  AllTimeHigh: r.AllTimeHigh,
  DividendReceived: r.DividendReceived,
  TargetWeightPercent: r.TargetWeightPercent,
}));
const ws2 = XLSX.utils.json_to_sheet(importRows);
ws2["!cols"] = Array(20).fill({ wch: 18 });
XLSX.utils.book_append_sheet(wb, ws2, "Import Ready");

const outPath = path.resolve(__dirname, "../sample-portfolio.xlsx");
XLSX.writeFile(wb, outPath);
console.log(`✓ Generated: ${outPath}`);
console.log(`  Stocks: ${rows.length}`);
console.log(`  Sheets: Portfolio Data, Import Ready`);
