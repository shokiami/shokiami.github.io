// g++ mandelbrot.cc -o mandelbrot -O3 -std=c++17 -lpng
#include "png++/png.hpp"
#include <iostream>
#include <string>
#include <vector>
#include <filesystem>

using std::cout;
using std::endl;
using std::min;
using std::max;
using std::to_string;
using std::string;
using std::vector;
namespace fs = std::filesystem;

#define REAL 0.33888665790093404
#define IMAG 0.57352752336659824
#define WIDTH 1920
#define HEIGHT 1080
#define COUNT 140
#define SCALAR 1.28402541669  // e^(1/4)
#define CENTER_X1 0.1
#define CENTER_Y1 0.0
#define ZOOM_X2 0.4
#define ZOOM_Y2 0.3
#define ZOOM_SCALAR 0.3
#define BAILOUT 1024
#define DIR "assets/mandelbrot/"

void render(long double zoom, int max_itr, double x, double y, string filename) {
  png::image<png::rgb_pixel> image = png::image<png::rgb_pixel>(WIDTH, HEIGHT);
  int percent = 0;
  for (int i = 0; i < HEIGHT; i++) {
    for (int j = 0; j < WIDTH; j++) {
      long double c_r = (j - (0.5 + x) * WIDTH) / min(WIDTH, HEIGHT) / (ZOOM_SCALAR * zoom) + REAL;
      long double c_i = ((0.5 - y) * HEIGHT - i) / min(WIDTH, HEIGHT) / (ZOOM_SCALAR * zoom) + IMAG;
      long double z_r = 0.0;
      long double z_i = 0.0;
      long double z_r2 = 0.0;
      long double z_i2 = 0.0;
      for (int itr = 0; itr < max_itr; itr++) {
        z_i = 2.0 * z_r * z_i + c_i;
        z_r = z_r2 - z_i2 + c_r;
        z_r2 = z_r * z_r;
        z_i2 = z_i * z_i;
        if (z_r2 + z_i2 > BAILOUT * BAILOUT) {
          double itr_cont = itr + 1.0 - log2(0.5 * log(z_r2 + z_i2) / log(BAILOUT));
          int c = 128 * sin(1.44 * log(itr_cont)) + 128;
          image[i][j] = png::rgb_pixel(c, c, c);
          break;
        }
      }
      if (100.0 * (i * WIDTH + j + 1) / (WIDTH * HEIGHT) - percent >= 1.0) {
        percent++;
        cout << filename + ": " + to_string(percent) + "%" << endl;
      }
    }
  }
  image.write(DIR + filename);
  cout << filename + ": done!" << endl;
}

int main() {
  fs::create_directory(DIR);
  for (int i = 0; i < COUNT; i++) {
    long double zoom = pow(SCALAR, i);
    int max_itr = 60000 * pow(zoom, 0.08) - 59000;
    double p = pow(0.5, i);
    double zoom_x1 = REAL * ZOOM_SCALAR * min(WIDTH, HEIGHT) / WIDTH + CENTER_X1;
    double zoom_y1 = IMAG * ZOOM_SCALAR * min(WIDTH, HEIGHT) / HEIGHT + CENTER_Y1;
    double x = p * zoom_x1 + (1.0 - p) * ZOOM_X2;
    double y = p * zoom_y1 + (1.0 - p) * ZOOM_Y2;
    string filename = to_string(i) + ".png";
    render(zoom, max_itr, x, y, filename);
  }
  return EXIT_SUCCESS;
}
