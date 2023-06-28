// g++ mandelbrot.cc -o mandelbrot -O3 -std=c++17 -lpng
#include "png++/png.hpp"
#include <iostream>
#include <string>
#include <vector>
#include <filesystem>

#define WIDTH 1920
#define HEIGHT 1080
#define DIR "images/"

const std::vector<png::rgb_pixel> palette = {
  {250, 250, 250}, {200, 200, 200}, {150, 150, 150}, {100, 100, 100}, { 50,  50,  50}, {  9,   1,  47}, {  4,   4,  73},
  {  0,   7, 100}, {  1,  44, 138}, { 24,  82, 177}, { 57, 125, 209}, {134, 181, 229}, {211, 236, 248}, {241, 233, 191},
  {248, 201,  95}, {255, 170,   0}, {204, 128,   0}, {153,  87,   0}, {106,  52,   3}, { 25,   7,  26}, { 66,  30,  15},
};

void render(long double real, long double imag, long double zoom, int max_itr, std::string filename) {
  const int bailout = 1024;
  int percent = 0;
  double min_itr = max_itr;
  std::vector<double> itrs = std::vector<double>(WIDTH * HEIGHT);
  for (int i = 0; i < HEIGHT; i++) {
    for (int j = 0; j < WIDTH; j++) {
      long double c_r = 4.0 * (j - WIDTH / 2) / std::min(WIDTH, HEIGHT) / zoom + real;
      long double c_i = 4.0 * (HEIGHT / 2 - i) / std::min(WIDTH, HEIGHT) / zoom + imag;
      long double z_r = 0.0;
      long double z_i = 0.0;
      long double z_r2 = 0.0;
      long double z_i2 = 0.0;
      for (int itr = 0; itr < max_itr; itr++) {
        z_i = 2.0 * z_r * z_i + c_i;
        z_r = z_r2 - z_i2 + c_r;
        z_r2 = z_r * z_r;
        z_i2 = z_i * z_i;
        if (z_r2 + z_i2 > bailout * bailout) {
          double itr_cont = itr + 1.0 - log2(0.5 * log(z_r2 + z_i2) / log(bailout));
          itrs[i * WIDTH + j] = itr_cont;
          if (itr_cont < min_itr) {
            min_itr = itr_cont;
          }
          break;
        }
      }
      if (100.0 * (i * WIDTH + j + 1) / (HEIGHT * WIDTH) - percent >= 1.0) {
        percent++;
        std::cout << filename + ": " + std::to_string(percent) + "%" << std::endl;
      }
    }
  }
  std::cout << filename + ": saving..." << std::endl;
  png::image<png::rgb_pixel> image = png::image<png::rgb_pixel>(WIDTH, HEIGHT);
  for (int i = 0; i < HEIGHT; i++) {
    for (int j = 0; j < WIDTH; j++) {
      double itr_cont = itrs[i * WIDTH + j];
      if (itr_cont == 0.0) {
        continue;
      }
      double idx_cont = std::pow((itr_cont - min_itr) / (max_itr - min_itr), 0.6) * palette.size();
      int idx = idx_cont;
      double p = idx_cont - idx;
      png::rgb_pixel color_1 = palette[idx % palette.size()];
      png::rgb_pixel color_2 = palette[(idx + 1) % palette.size()];
      int r = (1.0 - p) * color_1.red + p * color_2.red;
      int g = (1.0 - p) * color_1.green + p * color_2.green;
      int b = (1.0 - p) * color_1.blue + p * color_2.blue;
      image[i][j] = png::rgb_pixel(r, g, b);
    }
  }
  image.write(DIR + filename);
  std::cout << filename + ": done!" << std::endl;
}

int main() {
  long double real = -0.7436438870371591;
  long double imag =  0.1318259042053125;
  std::filesystem::create_directory(DIR);
  for (int i = 0; i <= 50; i++) {
    long double zoom = pow(2.0, i);
    int max_itr = 1000 * pow(zoom, 0.2);
    render(real, imag, zoom, max_itr, std::to_string(i) + ".png");
  }
  return EXIT_SUCCESS;
}
