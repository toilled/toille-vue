import re

with open('src/game/TrafficSystem.ts', 'r') as f:
    content = f.read()

# Replace `import { random } from "../utils/Random";` with `import { random, hashRandom } from "../utils/Random";`
content = content.replace('import { random } from "../utils/Random";', 'import { random, hashRandom } from "../utils/Random";')

# We need a stable identifier for each car. `car.userData.id` is a good choice. We can assign it during initCars.
# Then, for any random decision inside `resetCar` or `update`, we can use `hashRandom(car.userData.id + car.userData.resetCount * 1000)`.

# First, let's update `initCars`
#
#     for (let i = 0; i < totalCars; i++) {
#       const isPolice = i >= this.carCount;
#       const carGroup = this.carFactory.createCar(isPolice);
#       carGroup.userData.id = i;
#       carGroup.userData.resetCount = 0;
#       this.resetCar(carGroup);
#

init_cars_search = """
    for (let i = 0; i < totalCars; i++) {
      const isPolice = i >= this.carCount;
      const carGroup = this.carFactory.createCar(isPolice);

      this.resetCar(carGroup);"""

init_cars_replace = """
    for (let i = 0; i < totalCars; i++) {
      const isPolice = i >= this.carCount;
      const carGroup = this.carFactory.createCar(isPolice);
      carGroup.userData.id = i;
      carGroup.userData.resetCount = 0;

      this.resetCar(carGroup);"""

content = content.replace(init_cars_search, init_cars_replace)

reset_car_search = """
    const axis = random.next() > 0.5 ? "x" : "z";
    const dir = random.next() > 0.5 ? 1 : -1;

    const roadIndex = Math.floor(random.next() * (GRID_SIZE + 1));
    const roadCoordinate = START_OFFSET + roadIndex * CELL_SIZE - CELL_SIZE / 2;
    const laneOffset = (random.next() > 0.5 ? 1 : -1) * (ROAD_WIDTH / 4);

    let x = 0,
      z = 0;
    if (axis === "x") {
      z = roadCoordinate + laneOffset;
      x = (random.next() - 0.5) * CITY_SIZE;
      carGroup.rotation.y = dir === 1 ? Math.PI / 2 : -Math.PI / 2;
    } else {
      x = roadCoordinate + laneOffset;
      z = (random.next() - 0.5) * CITY_SIZE;
      carGroup.rotation.y = dir === 1 ? 0 : Math.PI;
    }

    carGroup.userData.heading = carGroup.rotation.y;
    carGroup.position.set(x, getHeight(x, z) + 1, z);

    // Reset properties
    Object.assign(carGroup.userData, {
      speed: isPolice ? 2.5 + random.next() * 1.5 : 0.5 + random.next() * 1.0,"""

reset_car_replace = """
    carGroup.userData.resetCount = (carGroup.userData.resetCount || 0) + 1;
    const seed = carGroup.userData.id * 1000 + carGroup.userData.resetCount;

    const axis = hashRandom(seed + 1) > 0.5 ? "x" : "z";
    const dir = hashRandom(seed + 2) > 0.5 ? 1 : -1;

    const roadIndex = Math.floor(hashRandom(seed + 3) * (GRID_SIZE + 1));
    const roadCoordinate = START_OFFSET + roadIndex * CELL_SIZE - CELL_SIZE / 2;
    const laneOffset = (hashRandom(seed + 4) > 0.5 ? 1 : -1) * (ROAD_WIDTH / 4);

    let x = 0,
      z = 0;
    if (axis === "x") {
      z = roadCoordinate + laneOffset;
      x = (hashRandom(seed + 5) - 0.5) * CITY_SIZE;
      carGroup.rotation.y = dir === 1 ? Math.PI / 2 : -Math.PI / 2;
    } else {
      x = roadCoordinate + laneOffset;
      z = (hashRandom(seed + 5) - 0.5) * CITY_SIZE;
      carGroup.rotation.y = dir === 1 ? 0 : Math.PI;
    }

    carGroup.userData.heading = carGroup.rotation.y;
    carGroup.position.set(x, getHeight(x, z) + 1, z);

    // Reset properties
    Object.assign(carGroup.userData, {
      speed: isPolice ? 2.5 + hashRandom(seed + 6) * 1.5 : 0.5 + hashRandom(seed + 6) * 1.0,"""

content = content.replace(reset_car_search, reset_car_replace)

# Now replace handlePoliceTurning random.next() with hashRandom
police_turn_search = """
      if (Math.abs(currentPos - roadCenter) < car.userData.speed * 1.5) {
        if (random.next() < 0.4) {
          const newDir = random.next() > 0.5 ? 1 : -1;
          const newLaneOffset =
            (random.next() > 0.5 ? 1 : -1) * (ROAD_WIDTH / 4);"""

police_turn_replace = """
      if (Math.abs(currentPos - roadCenter) < car.userData.speed * 1.5) {
        const seed = car.userData.id * 10000 + Math.floor(currentPos);
        if (hashRandom(seed + 1) < 0.4) {
          const newDir = hashRandom(seed + 2) > 0.5 ? 1 : -1;
          const newLaneOffset =
            (hashRandom(seed + 3) > 0.5 ? 1 : -1) * (ROAD_WIDTH / 4);"""

content = content.replace(police_turn_search, police_turn_replace)

# Now replace handleCollision random.next()
handle_col_search = """
      ai.userData.fading = true;
      ai.userData.dir *= -1;
      ai.userData.heading += random.next() - 0.5;
      this.spawnSparks(player.position);
    } else {
      if (random.next() > 0.5) return;

      carA.userData.fading = true;
      carB.userData.fading = true;

      carA.userData.dir *= -1;
      carB.userData.dir *= -1;

      carA.userData.heading += random.next() - 0.5;
      carB.userData.heading += random.next() - 0.5;
    }"""

handle_col_replace = """
      ai.userData.fading = true;
      ai.userData.dir *= -1;
      ai.userData.heading += hashRandom(ai.uuid.charCodeAt(0)) - 0.5;
      this.spawnSparks(player.position);
    } else {
      const seed = carA.userData.id * 1000 + carB.userData.id;
      if (hashRandom(seed) > 0.5) return;

      carA.userData.fading = true;
      carB.userData.fading = true;

      carA.userData.dir *= -1;
      carB.userData.dir *= -1;

      carA.userData.heading += hashRandom(seed + 1) - 0.5;
      carB.userData.heading += hashRandom(seed + 2) - 0.5;
    }"""

content = content.replace(handle_col_search, handle_col_replace)

with open('src/game/TrafficSystem.ts', 'w') as f:
    f.write(content)
