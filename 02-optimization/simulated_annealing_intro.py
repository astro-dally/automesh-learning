"""
LESSON 3: Simulated Annealing - Finding Optimal Solutions

Simulated annealing is inspired by metallurgy (cooling metal).
Key idea: Accept worse solutions sometimes to escape local optima.

This example teaches:
- How simulated annealing works
- Temperature and cooling schedules
- Accepting/rejecting solutions

Simple problem: Find minimum of a mathematical function
"""

import random
import math

def objective_function(x):
    """
    A function with multiple local minima.
    Goal: Find x that minimizes this function.
    
    Try plotting this to see the landscape!
    """
    return x**2 + 10 * math.sin(x)

def simulated_annealing(initial_temp=100, cooling_rate=0.95, iterations=1000):
    """
    Use simulated annealing to find the minimum of objective_function.
    
    Args:
        initial_temp: Starting temperature (higher = more exploration)
        cooling_rate: How fast temperature decreases (0-1)
        iterations: Number of steps to take
    """
    # Start with a random solution
    current_solution = random.uniform(-10, 10)
    current_cost = objective_function(current_solution)
    
    # Track the best solution found
    best_solution = current_solution
    best_cost = current_cost
    
    temperature = initial_temp
    
    print("=" * 60)
    print("SIMULATED ANNEALING OPTIMIZATION")
    print("=" * 60)
    print(f"Initial solution: x = {current_solution:.3f}, cost = {current_cost:.3f}")
    
    for iteration in range(iterations):
        # Generate a neighbor (small random change)
        neighbor = current_solution + random.uniform(-1, 1)
        neighbor_cost = objective_function(neighbor)
        
        # Calculate cost difference
        delta_cost = neighbor_cost - current_cost
        
        # Decide whether to accept the neighbor
        if delta_cost < 0:
            # Better solution - always accept
            accept = True
            reason = "better"
        else:
            # Worse solution - accept with probability based on temperature
            acceptance_probability = math.exp(-delta_cost / temperature)
            accept = random.random() < acceptance_probability
            reason = f"worse but accepted (p={acceptance_probability:.3f})"
        
        if accept:
            current_solution = neighbor
            current_cost = neighbor_cost
            
            # Update best if needed
            if current_cost < best_cost:
                best_solution = current_solution
                best_cost = current_cost
                
                # Print progress at key moments
                if iteration % 100 == 0:
                    print(f"\nIter {iteration}: New best! x = {best_solution:.3f}, cost = {best_cost:.3f}")
        
        # Cool down the temperature
        temperature *= cooling_rate
        
        # Print occasional updates
        if iteration % 200 == 0 and iteration > 0:
            print(f"Iter {iteration}: temp = {temperature:.2f}, current cost = {current_cost:.3f}")
    
    print("\n" + "=" * 60)
    print("FINAL RESULT")
    print("=" * 60)
    print(f"Best solution found: x = {best_solution:.3f}")
    print(f"Best cost: {best_cost:.3f}")
    print(f"(True minimum is around x = -1.3, cost ≈ -8.1)")
    
    return best_solution, best_cost

# Run the optimization
simulated_annealing()

print("\n" + "=" * 60)
print("KEY CONCEPTS FOR AUTOMESH:")
print("=" * 60)
print("1. Current solution = a network topology")
print("2. Cost function = latency + redundancy penalty")
print("3. Neighbor = topology with one edge added/removed")
print("4. Temperature = how willing to try radical changes")
print("5. Cooling = gradually becoming more conservative")
print("\n" + "=" * 60)
print("EXPERIMENTS:")
print("=" * 60)
print("- Change cooling_rate to 0.99 (slower cooling)")
print("- Change initial_temp to 10 (less exploration)")
print("- Modify objective_function to test different landscapes")
print("- Track and plot cost over iterations")
