//IBMUSER$ JOB {{job.account}},'ASM/BIND/RUN',MSGCLASS=A,CLASS=A,
//             MSGLEVEL=(1,1),REGION=0M
/*JOBPARM SYSAFF=*
//*
//         SET SRC={{program.name}}
//*
//* *******************************************************************
//* A S S E M B L E
//* *******************************************************************
//*
//ASSEMBLE EXEC PGM=ASMA90
//ASMAOPT  DD  *
ADATA
RENT
MACHINE(ZSERIES-5)
LIST(133)
//
//SYSADATA DD  DISP=SHR,DSN=IBMUSER.WORK.ADATA(&SRC)          ADATAS    12312312
//SYSLIB   DD  DISP=SHR,DSN=IBMUSER.WORK.ASMMAC               MACRO'S
//         DD  DISP=SHR,DSN=SYS1.MACLIB
//         DD  DISP=SHR,DSN=SYS1.MODGEN
//         DD  DISP=SHR,DSN=ASMA.SASMMAC2
//         DD  DISP=SHR,DSN=CBC.SCCNSAM
//         DD  DISP=SHR,DSN=TCPIP.AEZAMAC1
//SYSPRINT DD  SYSOUT=*                                       Listing
//SYSIN    DD  DISP=SHR,DSN=IBMUSER.WORK.ASMPGM(&SRC)         GEN'D ASM
//SYSLIN   DD  DISP=SHR,DSN=IBMUSER.WORK.OBJLIB(&SRC)         OBJECT
//*
//* ********************************************************************12312312
//* B I N D   M O D U L E
//* *******************************************************************
//*
//         IF (RC = 0) THEN sdf
// endif THEN
//BGNIFOK IF STEP1RC = 0 AND STEP2.RC = 0) OR
// (asdsad )
// (STEP1.RUN = FALSE AND STEP2.RUN  = FALSE)) THEN
//BGNIFOK IF ((STEP1RC = 0 AND STEP2.RC = 0) OR
// (asdsad )
// (STEP1.RUN = FALSE AND STEP2.RUN  = FALSE)) THEN sdf
//CREATE EXEC PGM=IOEFSUTL,REGION=0M,COND=(0,LT),
//  PARM=('format -aggregate ${prefix}.ZFS')
// ELSE (asdasd asdasd asd)
//BIND     EXEC PGM=IEWL,PARM='OPTIONS=IEWLOPT'
//IEWLOPT  DD  *
 LIST
 MAP
 XREF
//,nn  fff ddd                                                   12312312
//OBJECT   DD  DISP=SHR,DSN=IBMUSER.WORK.OBJLIB               OBJECTdd   asd
//SYSLIN   DD  *                                                LNKINC
 INCLUDE OBJECT(TEMPLATE)                                                ddddd
 SETOPT PARM(REUS=REFR)
 ORDER TEMPLATE(P)
 ENTRY TEMPLATE
 NAME TEMPLATE(R)
/*
//SYSLMOD  DD  DISP=SHR,DSN=IBMUSER.WORK.LOADLIB(&SRC)  asdd       LOAD MOD
//SYSPRINT DD  SYSOUT=*                                       Listing
//         ENDIF
//* *******************************************************************s
//* L I N K   M O D U L E
//* *******************************************************************
//*
//         _IF_ (RC = 0) THEN
//RUN      EXEC PGM=&SRC,PARM=('HELLO WORLD')
//STEPLIB  DD  DISP=SHR,DSN=IBMUSER.WORK.LOADLIB
//SNAP     DD  SYSOUT=*
//SYSPRINT DD  SYSOUT=*
//SYSMDUMP DD  DUMMY
//         ENDIF