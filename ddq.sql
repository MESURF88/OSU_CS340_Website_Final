SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `building`;
DROP TABLE IF EXISTS `energy_plant`;
DROP TABLE IF EXISTS `energy_company`;
DROP TABLE IF EXISTS `energy_plant_company`;
DROP TABLE IF EXISTS `energy_source`;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE energy_source (
    energy_source_id int(11) NOT NULL AUTO_INCREMENT,
    energy_source_name varchar(255) NOT NULL UNIQUE,
    renewable varchar(255) NOT NULL,
    energy_cost float(8),
    PRIMARY KEY (energy_source_id, energy_source_name)
) ENGINE=InnoDB;

CREATE TABLE energy_company (
    energy_company_id int(11) NOT NULL AUTO_INCREMENT,
    energy_company_name varchar(255) NOT NULL UNIQUE,
    net_worth float(16),
    PRIMARY KEY (energy_company_id)
) ENGINE=InnoDB;

CREATE TABLE building (
    building_id int(11) NOT NULL AUTO_INCREMENT,
	energy_company_id int(11) NOT NULL,
    building_name varchar(255) NOT NULL UNIQUE,
    b_square_feet int(11),
    build_date date,
    _function varchar(255) NOT NULL,
    energy_consumption int(11),
	FOREIGN KEY (energy_company_id) REFERENCES energy_company(energy_company_id) ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY (building_id)
) ENGINE=InnoDB;

CREATE TABLE energy_plant(
    energy_plant_id int(11) NOT NULL AUTO_INCREMENT,
    energy_source_id int(11),
    energy_plant_name varchar(255) NOT NULL UNIQUE,
    power_output int(11),
    p_square_feet int(11),
    transmission varchar(255) NOT NULL,
    maintenance_cost float(8),
    energy_price float(8),
    FOREIGN KEY (energy_source_id) REFERENCES energy_source(energy_source_id) ON DELETE CASCADE,
    PRIMARY KEY (energy_plant_id)
) ENGINE=InnoDB;

CREATE TABLE energy_plant_company(
    energy_company_id int(11),
    energy_plant_id int(11),
    FOREIGN KEY (energy_company_id) REFERENCES energy_company(energy_company_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (energy_plant_id) REFERENCES energy_plant(energy_plant_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY (energy_company_id, energy_plant_id)
) ENGINE=InnoDB;

INSERT INTO energy_source (energy_source_id, energy_source_name, renewable, energy_cost)
VALUES (1, 'oil', 'hydrocarbon', 50),(2, 'solar', 'renewable', 80),(3, 'geothermal', 'alternative', 100);

INSERT INTO energy_company (energy_company_id, energy_company_name, net_worth)
VALUES (1, 'Pacific Power', 4000);

INSERT INTO building (building_id, energy_company_id, building_name, b_square_feet, build_date, _function, energy_consumption) 
VALUES (1, 1, 'comcast', 10000, '1985-10-10', 'commercial', 1000),(2, 1, 'solar woods', 90000, '1985-10-10', 'residential', 100000),(3, 1, 'first factory', 1000000, '1945-10-10', 'industrial', 8000);

INSERT INTO energy_plant (energy_plant_id, energy_source_id, energy_plant_name, power_output, p_square_feet,
    transmission, maintenance_cost, energy_price)
VALUES (
    1,(SELECT energy_source_id FROM energy_source WHERE energy_source_name = 'oil'), 
    'Local Oil', 100, 10000, 'overhead', 1000, .99
),
(
	2,(SELECT energy_source_id FROM energy_source WHERE energy_source_name = 'solar'), 
    'Local Solar', 1000, 700, 'overhead', 1000, 3
);

INSERT INTO energy_plant_company (energy_company_id, energy_plant_id)
VALUES (
    (SELECT energy_company_id FROM energy_company WHERE energy_company_name = 'Pacific Power'),
    (SELECT energy_plant_id FROM energy_plant WHERE energy_plant_name = 'Local Oil')
),
(
	(SELECT energy_company_id FROM energy_company WHERE energy_company_name = 'Pacific Power'),
    (SELECT energy_plant_id FROM energy_plant WHERE energy_plant_name = 'Local Solar')
);

