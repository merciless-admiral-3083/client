{/* ... other code ... */}

<Pie
                        data={nutritionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        innerRadius={40}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => 
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        labelStyle={{ fill: 'hsl(var(--foreground))' }}
                      >
                        {nutritionData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={`hsl(${[215, 150, 45, 320, 180][index % 5]}, ${[70, 60, 80, 60, 70][index % 5]}%, ${[60, 50, 60, 60, 50][index % 5]}%)`}
                          />
                        ))}
</Pie>

{/* ... rest of the code ... */}