function nestByDistricts(data) {
    var dataByDistrict = d3.nest()
        .key(function(d) { return d.DISTRICT; })
        .key(function(d) { return d.YEAR; })
        .key(function(d) {
            if(d.OFFENSE_CODE > 110 && d.OFFENSE_CODE< 115){
                return "Homicides";
            }
            else if((d.OFFENSE_CODE > 210 && d.OFFENSE_CODE < 272)||
                (d.OFFENSE_CODE >1700 && d.OFFENSE_CODE < 1732)){
                return "Rape";
            }
            else if((d.OFFENSE_CODE > 400 && d.OFFENSE_CODE < 434)||
                (d.OFFENSE_CODE > 800 && d.OFFENSE_CODE < 804)){
                return "Assaults";
            }
            else if(d.OFFENSE_CODE > 300 && d.OFFENSE_CODE< 382){
                return "Robberies";
            }
            else if(d.OFFENSE_CODE > 509 && d.OFFENSE_CODE< 563){
                return "Burglaries";
            }
            else if(d.OFFENSE_CODE > 1400 && d.OFFENSE_CODE< 1500){
                return "Vandalism";
            }
            else{
                return "Total"
            }})
        .rollup(function(leaves) { return leaves.length; })
        .entries(data);

    return dataByDistrict;
}

function nestByType(data) {
    var dataByType = d3.nest()
        .key(function(d) { return d.DISTRICT; })
        .key(function(d) { return d.YEAR; })
        .key(function(d) {
            if(d.OFFENSE_CODE > 110 && d.OFFENSE_CODE< 115){
                return "Homicides";
            }
            else if((d.OFFENSE_CODE > 210 && d.OFFENSE_CODE < 272)||
                (d.OFFENSE_CODE >1700 && d.OFFENSE_CODE < 1732)){
                return "Rape";
            }
            else if((d.OFFENSE_CODE > 400 && d.OFFENSE_CODE < 434)||
                (d.OFFENSE_CODE > 800 && d.OFFENSE_CODE < 804)){
                return "Assaults";
            }
            else if(d.OFFENSE_CODE > 300 && d.OFFENSE_CODE< 382){
                return "Robberies";
            }
            else if(d.OFFENSE_CODE > 509 && d.OFFENSE_CODE< 563){
                return "Burglaries";
            }
            else if(d.OFFENSE_CODE > 1400 && d.OFFENSE_CODE< 1500){
                return "Vandalism";
            }
            else{
                return "Total"
            }})
        .key(function(d) {
            switch (d.OFFENSE_DESCRIPTION) {
                // Assault
                case "ASSAULT - AGGRAVATED":
                    return "Aggravated Assault";
                case "ASSAULT - SIMPLE":
                    return "Simple Assault";
                case "ASSAULT - AGGRAVATED - BATTERY":
                    return "Aggravated A+B";
                case "ASSAULT SIMPLE - BATTERY":
                    return "Simple Assault and Battery (A+B)";
                case "ASSAULT D/W - OTHER":
                case "ASSAULT & BATTERY D/W - OTHER":
                case "ASSAULT & BATTERY D/W - KNIFE":
                    return "Weapon";
                case "A&B ON POLICE OFFICER":
                case "ASSAULT & BATTERY D/W - OTHER ON POLICE OFFICER":
                case "ASSAULT D/W - KNIFE ON POLICE OFFICER":
                    return "On Police Officer";
                case "ASSAULT & BATTERY":
                case "A&B HANDS, FEET, ETC.  - MED. ATTENTION REQ.":
                    return "Other";
                // Vandalism
                case "VANDALISM":
                    return "Vandalism";
                case "GRAFFITI":
                    return "Graffiti";
                // Burglary
                case "BURGLARY - RESIDENTIAL - ATTEMPT":
                case "BURGLARY - RESIDENTIAL - NO FORCE":
                case "BURGLARY - RESIDENTIAL - FORCE":
                case "BURGLARY - RESIDENTIAL":
                case "B&E RESIDENCE NIGHT - ATTEMPT FORCE":
                case "B&E RESIDENCE DAY - NO PROP TAKEN":
                case "B&E RESIDENCE DAY - NO FORCE":
                    return "Residential Burglary";
                case "BURGLARY - COMMERICAL - NO FORCE":
                case "BURGLARY - COMMERICAL - FORCE":
                case "BURGLARY - COMMERICAL - ATTEMPT":
                case "BURGLARY - COMMERICAL":
                    return "Commercial Burglary";
                case "BREAKING AND ENTERING (B&E) MOTOR VEHICLE (NO PROPERTY STOLEN)":
                    return "Vehicle Burglary";
                case "BURGLARY - OTHER - FORCE":
                case "BURGLARY - OTHER - NO FORCE":
                case "BURGLARY - OTHER - ATTEMPT":
                case "B&E NON-RESIDENCE DAY - NO FORCE":
                case "B&E NON-RESIDENCE DAY - FORCIBLE":
                case "B&E NON-RESIDENCE DAY - NO PROP TAKEN":
                case "B&E NON-RESIDENCE NIGHT - FORCE":
                    return "Other Burglary";
                // Robbery
                case "ROBBERY - STREET":
                case "ROBBERY - UNARMED - STREET":
                case "ROBBERY - KNIFE - STREET":
                    return "Street Robbery";
                case "ROBBERY - COMMERCIAL":
                case "ROBBERY - UNARMED - BUSINESS":
                case "ROBBERY - UNARMED - CHAIN STORE":
                    return "Commercial Robbery";
                case "ROBBERY - HOME INVASION":
                    return "Home Invasion";
                case "ROBBERY - CAR JACKING":
                    return "Car Jacking";
                case "ROBBERY - BANK":
                case "ROBBERY ATTEMPT - KNIFE - BANK":
                    return "Bank Robbery";
                case "ROBBERY - UNARMED - RESIDENCE":
                case "ROBBERY":
                case "ROBBERY - OTHER":
                    return "Other Robbery";
                // Homicides
                case "MURDER, NON-NEGLIGIENT MANSLAUGHTER":
                    return "Non-Negligent Manslaughter";
                // Rape
                case "SEX OFFENSE - RAPE - FORCIBLE":
                case "SEX OFFENSE - RAPE - SEXUAL ASSAULT W/ OBJECT":
                case "SEX OFFENSE - RAPE -  OTHER":
                case "Fondling - Indecent Assault":
                case "SEXUAL ASSAULT KIT COLLECTED":
                case "SEX OFFENSE - RAPE -  FONDLING": return "Rape";
            }
        })
        .rollup(function(leaves) { return leaves.length; })
        .entries(data);

    return dataByType;
}