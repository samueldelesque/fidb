var Request = require("request"),
	Csv = require("fast-csv"),
	Mongolian = require('mongolian'),
	forEach = require("for-each"),
	ObjectId = require('mongolian').ObjectId,

	dbserver = new Mongolian,
	db = dbserver.db("fidb"),
	sp500 = db.collection("sp500"),

	format = ["s","n","l1"].join(""),
	provider = "http://download.finance.yahoo.com/d/quotes.csv?",

	sp500quotes = "A,AA,AAPL,ABC,ABT,ACE,ACN,ADBE,ADI,ADM,ADP,ADSK,ADT,AEE,AEP,AES,AET,AFL,AGN,AIG,AIV,AIZ,AKAM,ALL,ALTR,ALXN,AMAT,AMD,AMGN,AMP,AMT,AMZN,AN,ANF,AON,APA,APC,APD,APH,APOL,ARG,ATI,AVB,AVP,AVY,AXP,AZO,BA,BAC,BAX,BBBY,BBT,BBY,BCR,BDX,BEAM,BEN,BF.B,BHI,BIG,BIIB,BK,BLK,BLL,BMC,BMS,BMY,BRCM,BRK.B,BSX,BTU,BWA,BXP,C,CA,CAG,CAH,CAM,CAT,CB,CBG,CBS,CCE,CCI,CCL,CELG,CERN,CF,CFN,CHK,CHRW,CI,CINF,CL,CLF,CLX,CMA,CMCSA,CME,CMG,CMI,CMS,CNP,CNX,COF,COG,COH,COL,COP,COST,COV,CPB,CRM,CSC,CSCO,CSX,CTAS,CTL,CTSH,CTXS,CVC,CVH,CVS,CVX,D,DD,DE,DELL,DF,DFS,DG,DGX,DHI,DHR,DIS,DISCA,DLTR,DNB,DNR,DO,DOV,DOW,DPS,DRI,DTE,DTV,DUK,DVA,DVN,EA,EBAY,ECL,ED,EFX,EIX,EL,EMC,EMN,EMR,EOG,EQR,EQT,ESRX,ESV,ETFC,ETN,ETR,EW,EXC,EXPD,EXPE,F,FAST,FCX,FDO,FDX,FE,FFIV,FHN,FII,FIS,FISV,FITB,FLIR,FLR,FLS,FMC,FOSL,FRX,FSLR,FTI,FTR,GAS,GCI,GD,GE,GILD,GIS,GLW,GME,GNW,GOOG,GPC,GPS,GS,GT,GWW,HAL,HAR,HAS,HBAN,HCBK,HCN,HCP,HD,HES,HIG,HNZ,HOG,HON,HOT,HP,HPQ,HRB,HRL,HRS,HSP,HST,HSY,HUM,IBM,ICE,IFF,IGT,INTC,INTU,IP,IPG,IR,IRM,ISRG,ITW,IVZ,JBL,JCI,JCP,JDSU,JEC,JNJ,JNPR,JOY,JPM,JWN,K,KEY,KIM,KLAC,KMB,KMI,KMX,KO,KR,KRFT,KSS,L,LEG,LEN,LH,LIFE,LLL,LLTC,LLY,LM,LMT,LNC,LO,LOW,LRCX,LSI,LTD,LUK,LUV,LYB,M,MA,MAR,MAS,MAT,MCD,MCHP,MCK,MCO,MDLZ,MDT,MET,MHP,MJN,MKC,MMC,MMM,MNST,MO,MOLX,MON,MOS,MPC,MRK,MRO,MS,MSFT,MSI,MTB,MU,MUR,MWV,MYL,NBL,NBR,NDAQ,NE,NEE,NEM,NFLX,NFX,NI,NKE,NOC,NOV,NRG,NSC,NTAP,NTRS,NU,NUE,NVDA,NWL,NWSA,NYX,OI,OKE,OMC,ORCL,ORLY,OXY,PAYX,PBCT,PBI,PCAR,PCG,PCL,PCLN,PCP,PCS,PDCO,PEG,PEP,PETM,PFE,PFG,PG,PGR,PH,PHM,PKI,PLD,PLL,PM,PNC,PNR,PNW,POM,PPG,PPL,PRGO,PRU,PSA,PSX,PWR,PX,PXD,QCOM,QEP,R,RAI,RDC,RF,RHI,RHT,RL,ROK,ROP,ROST,RRC,RRD,RSG,RTN,S,SAI,SBUX,SCG,SCHW,SE,SEE,SHW,SIAL,SJM,SLB,SLM,SNA,SNDK,SNI,SO,SPG,SPLS,SRCL,SRE,STI,STJ,STT,STX,STZ,SWK,SWN,SWY,SYK,SYMC,SYY,T,TAP,TDC,TE,TEG,TEL,TER,TGT,THC,TIE,TIF,TJX,TMK,TMO,TRIP,TROW,TRV,TSN,TSO,TSS,TWC,TWX,TXN,TXT,TYC,UNH,UNM,UNP,UPS,URBN,USB,UTX,V,VAR,VFC,VIAB,VLO,VMC,VNO,VRSN,VTR,VZ,WAG,WAT,WDC,WEC,WFC,WFM,WHR,WIN,WLP,WM,WMB,WMT,WPI,WPO,WPX,WU,WY,WYN,WYNN,X,XEL,XL,XLNX,XOM,XRAY,XRX,XYL,YHOO,YUM,ZION,ZMH",
	interval = 5 * 60 * 1000

function save_data(symbols,format){
	if(!symbols||!format)return false
	Request.get(provider+"f="+format+"&s="+symbols+"&e=.csv", function (error, response, body) {
		if (!error && response.statusCode == 200) {
			var now = new Date()

			Csv.fromString(body, {headers: [
				"symbol",
				"name",
				"price"
			]}).on("data", function(data){
                        if(!data.price || !data.name || data.symbol){
                              //freak out
                        }
                        else{
      				data.price = parseFloat(data.price)
      				data.time = now
      				sp500.insert(data)
                        }
			}).on("end", function(){
                        console.log(now,"Market values recorded.");
				// tell api test service to not freak out just then.
			});
		}
	});
}

setInterval(function(){save_data(sp500quotes,format)},interval);

save_data(sp500quotes,format)



/*

Yahoo Formats:

      Symbol                            s
      Name                              n
      Last Trade (With Time)            l
      Last Trade (Price Only)           l1
      Last Trade Date                   d1
      Last Trade Time                   t1
      Last Trade Size                   k3
      Change and Percent Change         c
      Change                            c1
      Change in Percent                 p2
      Ticker Trend                      t7
      Volume                            v
      Average Daily Volume              a2
      More Info                         i
      Trade Links                       t6
      Bid                               b
      Bid Size                          b6
      Ask                               a
      Ask Size                          a5
      Previous Close                    p
      Open                              o
      Day's Range                       m
      52-week Range                     w
      Change From 52-wk Low             j5
      Pct Chg From 52-wk Low            j6
      Change From 52-wk High            k4
      Pct Chg From 52-wk High           k5
      Earnings/Share                    e
      P/E Ratio                         r
      Short Ratio                       s7
      Dividend Pay Date                 r1
      Ex-Dividend Date                  q
      Dividend/Share                    d
      Dividend Yield                    y
      Float Shares                      f6
      Market Capitalization             j1
      1yr Target Price                  t8
      EPS Est. Current Yr               e7
      EPS Est. Next Year                e8
      EPS Est. Next Quarter             e9
      Price/EPS Est. Current Yr         r6
      Price/EPS Est. Next Yr            r7
      PEG Ratio                         r5
      Book Value                        b4
      Price/Book                        p6
      Price/Sales                       p5
      EBITDA                            j4
      50-day Moving Avg                 m3
      Change From 50-day Moving Avg     m7
      Pct Chg From 50-day Moving Avg    m8
      200-day Moving Avg                m4
      Change From 200-day Moving Avg    m5
      Pct Chg From 200-day Moving Avg   m6
      Shares Owned                      s1
      Price Paid                        p1
      Commission                        c3
      Holdings Value                    v1
      Day's Value Change                w1,
      Holdings Gain Percent             g1
      Holdings Gain                     g4
      Trade Date                        d2
      Annualized Gain                   g3
      High Limit                        l2
      Low Limit                         l3
      Notes                             n4
      Last Trade (Real-time) with Time  k1
      Bid (Real-time)                   b3
      Ask (Real-time)                   b2
      Change Percent (Real-time)        k2
      Change (Real-time)                c6
      Holdings Value (Real-time)        v7
      Day's Value Change (Real-time)    w4
      Holdings Gain Pct (Real-time)     g5
      Holdings Gain (Real-time)         g6
      Day's Range (Real-time)           m2
      Market Cap (Real-time)            j3
      P/E (Real-time)                   r2
      After Hours Change (Real-time)    c8
      Order Book (Real-time)            i5
      Stock Exchange                    x

*/