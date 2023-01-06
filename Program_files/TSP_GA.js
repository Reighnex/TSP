var cities = []; // 경유할 도시들의 리스트
var totalCities = 25; // 총 도시의 수

var popSize = 650; // 모집단 수
var population = []; // 모집단 리스트
var fitness = []; // 적합도 리스트

var bestDistance = Infinity; // 역대 최단거리
var bestRoute; // 최단거리 경로
var currentBest; // 한 세대 내 최단경로

var genCnt = 0; // 세대 카운터

function setup() {
  createCanvas(550, 550); // 캔버스 생성
  var route = []; // 경로 리스트

  for (var i = 0; i < totalCities; i++) { // 도시 생성
    var v = createVector(random(width), random(height));
    cities[i] = v;
    route[i] = i; // 경로리스트에 인덱스 대입
  }

  for (var i = 0; i < popSize; i++) { // 유전 집단 생성
    population[i] = shuffle(route);
  }
}

function draw() {
  background(0); // 배경 (초기화)
  //frameRate(5); // 프레임 레이트 설정

  calcFitness(); // 적합도 측정
  normalizeFitness(); // 적합도 일반(확률)화
  nextGeneration(); // 다음세대로 유전

  stroke(255); // 현 세대의 최단거리 경로 시각화
  strokeWeight(1);
  noFill();
  beginShape();
  for (var i = 0; i < currentBest.length; i++) {
    var n = currentBest[i];
    vertex(cities[n].x, cities[n].y);
  }
  vertex(cities[currentBest[0]].x, cities[currentBest[0]].y);
  endShape();

  stroke(178, 204, 255); // 역대 최단거리 경로 시각화
  strokeWeight(3);
  noFill();
  beginShape();
  for (var i = 0; i < bestRoute.length; i++) {
    var n = bestRoute[i];
    vertex(cities[n].x, cities[n].y);
    ellipse(cities[n].x, cities[n].y, 10, 10);
  }
  vertex(cities[bestRoute[0]].x, cities[bestRoute[0]].y);
  endShape();

  stroke(255);
  strokeWeight(1);
  textSize(30);
  fill(255);
  text("Total Distance = " + nf(bestDistance, 0, 2), 10, height - 10);
  text("Generation " + genCnt, 10, height - 45);

  // 테스트용
  //concole.log(bestRoute);
  //console.log(currentBest);
}

function swap(obj, i, j) { // 리스트의 두 요소 교환
  var temp = obj[i];
  obj[i] = obj[j];
  obj[j] = temp;
}

function calcDistance(spots, route) { // 경로의 총 이동거리 계산
  var cycle = []; // 순환경로
  var sum = 0;

  for (var i = 0; i < route.length; i++) {
    cycle[i] = route[i];
  }
  cycle.push(cycle[0]);

  for (var i = 0; i < cycle.length - 1; i++) {
    var cityAIndex = cycle[i];
    var cityA = spots[cityAIndex]; // 한 도시
    var cityBIndex = cycle[i + 1];
    var cityB = spots[cityBIndex]; // 그 다음 도시
    var d = dist(cityA.x, cityA.y, cityB.x, cityB.y); // 거리 계산
    sum += d; // 거리 합산
  }
  return sum; // 총 거리 반환
}

function calcFitness() { // 적합도 계산
  var currentRecord = Infinity; // 현 세대의 최단거리 경로
  for (var i = 0; i < population.length; i++) {
    var d = calcDistance(cities, population[i]); // 역대 최단거리(경로) 경신
    if (d < bestDistance) {
      bestDistance = d;
      bestRoute = population[i];
    }
    if (d < currentRecord) {
      currentRecord = d; // 현 세대 최단거리(경로) 경신
      currentBest = population[i];
    }
    fitness[i] = 1 / (pow(d, 8) + 1); // 거리에 반비례하는 적합도 부여
  }
}

function normalizeFitness() { // 적합도 확률화(총합이 1)
  var sum = 0;
  for (var i = 0; i < fitness.length; i++) {
    sum += fitness[i];
  }
  for (var i = 0; i < fitness.length; i++) {
    fitness[i] = fitness[i] / sum;
  }
}

function nextGeneration() { // 다음 세대 유전 전개
  var newPopulation = []; // 다음 세대 모집단

  for (var i = 0; i < population.length; i++) {
    var routeA = selection(population, fitness); // 자연선택 1
    var routeB = selection(population, fitness); // 자연선택 2
    var route = crossOver(routeA, routeB); // 교배
    mutate(route, 0.04); // 돌연변이, 확률
    newPopulation[i] = route;
  }
  population = newPopulation; // 모집단 교체
  genCnt++; // 세대 카운터 +1
}

function selection(list, prob) { // 자연선택
  var index = 0;
  var r = random(1);

  while (r > 0) { // 적합도에 따라 확률적 선택
    r = r - prob[index];
    index++;
  }
  index--;
  return list[index].slice(); // 자연선택 결과 반환
}

function crossOver(routeA, routeB) {
  // 교배
  var start = floor(random(routeA.length));
  var end = floor(random(start + 1, routeA.length));
  var newRoute = routeA.slice(start, end); // 경로 내 무작위 부분 잘라냄
  for (var i = 0; i < routeB.length; i++) {
    var city = routeB[i];
    if (!newRoute.includes(city)) { // 나머지 부분에
      newRoute.push(city); // 남은 도시들 채움
    }
  }
  return newRoute; // 새 경로 반환
}

function mutate(route, prob) { // 돌연변이
  for (var i = 0; i < totalCities; i++) {
    if (random(1) < prob) { // 확률적으로 두 도시 무작위 선택
      var indexA = floor(random(route.length));
      var indexB = floor(random(route.length));
      swap(route, indexA, indexB); // 교환
    }
  }
}