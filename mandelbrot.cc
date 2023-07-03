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

#define RES 1500
#define SCALAR 1.284  // e^(1/4)
#define DIR "images/"

const vector<png::rgb_pixel> palette = {
  {  9,   1,  47}, {  4,   4,  73}, {  0,   7, 100}, { 12,  44, 138},
  { 24,  82, 177}, { 57, 125, 209}, {134, 181, 229}, {211, 236, 248},
  {241, 233, 191}, {248, 201,  95}, {255, 170,   0}, {204, 128,   0},
  {153,  87,   0}, {106,  52,   3}, { 66,  30,  15}, { 25,   7,  26}, 
};

png::rgb_pixel idx_to_color(int idx) {
  double white_grad = 1.6;
  int white_limit = log(256) / log(white_grad) + 1;
  if (idx < white_limit) {
    int white = 256 - pow(white_grad, idx);
    return png::rgb_pixel(white, white, white);
  }
  return palette[(idx - white_limit) % palette.size()];
}

void render(long double real, long double imag, long double zoom, int max_itr, int height, int width, string filename) {
  vector<double> itrs = vector<double>(height * width);
  int bailout = 1024;
  double min_itr = max_itr;
  int percent = 0;
  for (int i = 0; i < height; i++) {
    for (int j = 0; j < width; j++) {
      long double c_r = 4.0 * (j - width / 2) / min(width, height) / zoom + real;
      long double c_i = 4.0 * (height / 2 - i) / min(width, height) / zoom + imag;
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
          itrs[i * width + j] = itr_cont;
          if (itr_cont < min_itr) {
            min_itr = itr_cont;
          }
          break;
        }
      }
      if (100.0 * (i * width + j + 1) / (height * width) - percent >= 1.0) {
        percent++;
        cout << filename + ": " + to_string(percent) + "%" << endl;
      }
    }
  }
  cout << filename + ": saving..." << endl;
  png::image<png::rgb_pixel> image = png::image<png::rgb_pixel>(width, height);
  double grad = 1.8 * pow(zoom, -0.15) + 1.8;
  for (int i = 0; i < height; i++) {
    for (int j = 0; j < width; j++) {
      double itr_cont = itrs[i * width + j];
      if (itr_cont == 0.0) {
        continue;
      }
      double idx_cont = grad * log(itr_cont - min_itr + 1.0);
      int idx = idx_cont;
      double p = idx_cont - idx;
      png::rgb_pixel color_1 = idx_to_color(idx);
      png::rgb_pixel color_2 = idx_to_color(idx + 1);
      int red = (1.0 - p) * color_1.red + p * color_2.red;
      int green = (1.0 - p) * color_1.green + p * color_2.green;
      int blue = (1.0 - p) * color_1.blue + p * color_2.blue;
      image[i][j] = png::rgb_pixel(red, green, blue);
    }
  }
  image.write(DIR + filename);
  cout << filename + ": done!" << endl;
}

int main() {
  long double real = -1.41771888487527228;
  long double imag =  0.00012464572571004;
  fs::create_directory(DIR);
  for (int i = 0; i < 150; i += 1) {
    long double zoom = pow(SCALAR, i);
    int max_itr = 60000 * pow(zoom, 0.08) - 59000;
    int width = RES * (1.0 + 1.2 * pow(0.4, i));
    render(real, imag, zoom, max_itr, RES, width, to_string(i) + ".png");
  }
  return EXIT_SUCCESS;
}
