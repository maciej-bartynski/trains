enum BuildingKind {
    // central
    CentralWarehouse = 'central-warehouse',

    // train buildings
    RailwayStation = 'railway-station',
    RailwayGarage = 'railway-garage',
    RailwayTerminus = 'railway-terminus',

    // ship buildings
    Harbour = 'harbour',
    CargoPortTop = 'cargo-port-top',
    CargoPortBottom = 'cargo-port-bottom',
    CargoPortLeft = 'cargo-port-left',
    CargoPortRight = 'cargo-port-right',

    // road buildings
    RoadGarage = 'road-garage',
    RoadWarehouse = 'road-warehouse',

    // factories: raw resources
    WoodFactory = 'wood-factory',
    ClayFactory = 'clay-factory',
    IronFactory = 'iron-factory',
    StoneFactory = 'stone-factory',
    CoalFactory = 'coal-factory',

    // factories: advanced resources
    BuildingMaterialsFactory = 'building-materials-factory',
    FuelFactory = 'fuel-factory',
    SteelFactory = 'steel-factory',
}

export default BuildingKind;


