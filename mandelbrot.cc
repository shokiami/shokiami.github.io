// g++ mandelbrot.cc -o mandelbrot -O3 -std=c++11 -lpng
#include "png++/png.hpp"
#include <iostream>
#include <string>
#include <vector>

using std::string;
using std::vector;
using std::min;
using std::max;

#define WIDTH 3840
#define HEIGHT 2160
#define MAX_ITR 1000
#define BAILOUT 256
#define GRADIENT 0.35

const vector<png::rgb_pixel> palette = {
  {9, 1, 47}, {4, 4, 73}, {0, 7, 100}, {1, 44, 138}, {24, 82, 177}, {57, 125, 209}, {134, 181, 229}, {211, 236, 248},
  {241, 233, 191}, {248, 201, 95}, {255, 170, 0}, {204, 128, 0}, {153, 87, 0}, {106, 52, 3}, {66, 30, 15}, {25, 7, 26}
};

void render(double real, double imag, double zoom, string filename) {
  png::image<png::rgb_pixel> image(WIDTH, HEIGHT);
  double max_itr = 100.0 * log(zoom + 1.0);
  for (int i = 0; i < HEIGHT; i++) {
    for (int j = 0; j < WIDTH; j++) {
      double c_r = 4.0 * (j - WIDTH / 2) / min(WIDTH, HEIGHT) / zoom + real;
      double c_i = 4.0 * (HEIGHT / 2 - i) / min(WIDTH, HEIGHT) / zoom + imag;
      double z_r = 0.0;
      double z_i = 0.0;
      double z_r2 = 0.0;
      double z_i2 = 0.0;
      for (int itr = 0; itr < MAX_ITR; itr++) {
        z_i = 2.0 * z_r * z_i + c_i;
        z_r = z_r2 - z_i2 + c_r;
        z_r2 = z_r * z_r;
        z_i2 = z_i * z_i;
        if (z_r2 + z_i2 > BAILOUT * BAILOUT) {
          double itr_s = GRADIENT * (itr + min(max(1.0 - log2(0.5 * log(z_r2 + z_i2) / log(BAILOUT)), 0.0), 1.0));
          int itr_f = itr_s;
          double p = itr_s - itr_f;
          png::rgb_pixel color_1 = palette[itr_f % palette.size()];
          png::rgb_pixel color_2 = palette[(itr_f + 1) % palette.size()];
          int r = (1 - p) * color_1.red + p * color_2.red;
          int g = (1 - p) * color_1.green + p * color_2.green;
          int b = (1 - p) * color_1.blue + p * color_2.blue;
          image[i][j] = png::rgb_pixel(r, g, b);
          break;
        }
      }
    }
  }
  image.write(filename);
}

int main() {
  render(-0.6, 0.0, 1.5, "mandelbrot_set.png");
  render(-0.8, 0.2, 10.0, "seahorse_valley.png");
  return EXIT_SUCCESS;
}
